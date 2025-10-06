import { useState, useMemo } from "react";
import { useRouter } from "next/router";
import {
  SortingState,
  VisibilityState,
  RowSelectionState,
} from "@tanstack/react-table";
import {
  parseAsInteger,
  parseAsString,
  useQueryStates,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsJson,
  parseAsStringEnum,
} from "nuqs";
import { z } from "zod";
import { UsersTable } from "@/components/company/users/UsersTable";
import { useSearchUsers } from "@/hooks/useUsers";
import { UserRole, User } from "@/types/userTypes";

interface UsersTableComponentProps {
  onInviteUser: () => void;
  onRowClick?: (user: User) => void;
  canInvite: boolean;
}

export default function UsersTableComponent({
  onInviteUser,
  onRowClick,
  canInvite,
}: UsersTableComponentProps) {
  const router = useRouter();

  // Zod validator for sort object
  const sortValidator = z.record(
    z.string(),
    z.union([z.literal(1), z.literal(-1)])
  );

  // URL state management with nuqs
  const [queryState, setQueryState] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    limit: parseAsInteger.withDefault(10),
    searchText: parseAsString.withDefault(""),
    roleFilter: parseAsArrayOf(parseAsStringEnum<UserRole>(Object.values(UserRole))).withDefault([]),
    statusFilter: parseAsArrayOf(parseAsBoolean).withDefault([]),
    sort: parseAsJson(sortValidator.parse).withDefault({
      createdAt: -1,
    }),
  });

  // Build search object from filters
  const searchParams = useMemo(() => {
    const search: Record<string, any> = {};

    // Add text search
    if (queryState.searchText) {
      search.email = queryState.searchText;
    }

    // Add role filter
    if (queryState.roleFilter.length > 0 && queryState.roleFilter.length < 4) {
      // Only filter if not all roles selected
      search.role = queryState.roleFilter[0]; // Backend expects single role, not array
    }

    // Add status filter
    if (queryState.statusFilter.length === 1) {
      search.isActive = queryState.statusFilter[0];
    }
    // If both selected or none selected, don't add filter (show all)

    return search;
  }, [queryState.searchText, queryState.roleFilter, queryState.statusFilter]);

  // Fetch users with React Query
  const {
    data: usersData,
    isLoading,
    isError,
    error,
  } = useSearchUsers({
    page: queryState.page,
    limit: queryState.limit,
    search: searchParams,
  });

  // Extract users and pagination
  const users = usersData?.data ?? [];
  const pagination = usersData?.meta;

  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Handle sorting change - update URL params
  const handleSortChange = (newSorting: SortingState) => {
    if (newSorting.length === 0) {
      setQueryState({ sort: { createdAt: -1 } });
      return;
    }

    const sortObj: Record<string, 1 | -1> = {};
    newSorting.forEach((sort) => {
      sortObj[sort.id] = sort.desc ? -1 : 1;
    });

    setQueryState({ sort: sortObj, page: 1 });
  };

  if (isError) {
    return (
      <div className="m-8 flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Error loading users</h3>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <UsersTable
        data={users}
        totalCount={pagination?.total || 0}
        currentPage={queryState.page}
        pageSize={queryState.limit}
        isLoading={isLoading}
        searchValue={queryState.searchText}
        onSearchChange={(value) =>
          setQueryState({ searchText: value, page: 1 })
        }
        roleFilter={queryState.roleFilter}
        onRoleFilterChange={(value) =>
          setQueryState({ roleFilter: value, page: 1 })
        }
        statusFilter={queryState.statusFilter}
        onStatusFilterChange={(value) =>
          setQueryState({ statusFilter: value, page: 1 })
        }
        onPageChange={(page) => setQueryState({ page })}
        onPageSizeChange={(limit) => setQueryState({ limit, page: 1 })}
        sorting={sorting}
        columnVisibility={columnVisibility}
        rowSelection={rowSelection}
        setSorting={setSorting}
        setColumnVisibility={setColumnVisibility}
        setRowSelection={setRowSelection}
        onSortChange={handleSortChange}
        onInviteUser={onInviteUser}
        canInvite={canInvite}
        onRowClick={onRowClick}
      />

      {pagination && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Showing {(queryState.page - 1) * queryState.limit + 1} to{" "}
          {Math.min(queryState.page * queryState.limit, pagination.total)} of{" "}
          {pagination.total} users
        </div>
      )}
    </div>
  );
}
