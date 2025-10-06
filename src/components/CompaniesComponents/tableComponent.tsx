import { useEffect, useState, useMemo } from "react";
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
} from "nuqs";
import { z } from "zod";
import { CompaniesTable } from "@/components/companies/CompaniesTable";
import { useCompanies } from "@/hooks/useCompany";

export default function CompaniesTableComponent() {
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
      search.nameOfCompany = { contains: queryState.searchText };
    }

    // Add status filter
    if (queryState.statusFilter.length === 1) {
      search.isActive = { eq: queryState.statusFilter[0] };
    }
    // If both selected or none selected, don't add filter (show all)

    return search;
  }, [queryState.searchText, queryState.statusFilter]);

  // Fetch companies with React Query
  const {
    data: companiesData,
    isLoading,
    isError,
    error,
  } = useCompanies({
    page: queryState.page,
    limit: queryState.limit,
    search: searchParams,
    sort: queryState.sort,
  });

  // Extract companies and pagination
  const companies = companiesData?.data.companies ?? [];
  const pagination = companiesData?.data.pagination;

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

  // Handle pagination changes
  useEffect(() => {
    // Sync pagination state with URL if needed
  }, [queryState.page, queryState.limit]);

  if (isError) {
    return (
      <div className="m-8 flex h-[400px] items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Error loading companies</h3>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="m-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
        <p className="text-muted-foreground">
          Manage your client companies and their information
        </p>
      </div>

      <CompaniesTable
        data={companies}
        totalCount={pagination?.totalCount || 0}
        currentPage={queryState.page}
        pageSize={queryState.limit}
        isLoading={isLoading}
        searchValue={queryState.searchText}
        onSearchChange={(value) =>
          setQueryState({ searchText: value, page: 1 })
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
      />

      {pagination && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Showing {(queryState.page - 1) * queryState.limit + 1} to{" "}
          {Math.min(queryState.page * queryState.limit, pagination.totalCount)}{" "}
          of {pagination.totalCount} companies
        </div>
      )}
    </div>
  );
}
