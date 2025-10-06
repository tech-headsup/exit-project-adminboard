import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  VisibilityState,
  RowSelectionState,
} from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTablePagination } from "@/components/data-table/DataTablePagination";
import { UsersToolbar } from "@/components/UsersComponents/UsersToolbar";
import { getUserColumns } from "./columns";
import { User, UserRole } from "@/types/userTypes";

interface UsersTableProps {
  /** User data */
  data: User[];

  /** Total count for pagination */
  totalCount?: number;

  /** Current page (1-indexed) */
  currentPage: number;

  /** Current page size */
  pageSize: number;

  /** Loading state */
  isLoading?: boolean;

  /** Search value */
  searchValue: string;

  /** Search change handler */
  onSearchChange: (value: string) => void;

  /** Role filter values */
  roleFilter: UserRole[];

  /** Role filter change handler */
  onRoleFilterChange: (value: UserRole[]) => void;

  /** Status filter values */
  statusFilter: boolean[];

  /** Status filter change handler */
  onStatusFilterChange: (value: boolean[]) => void;

  /** Pagination handlers */
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;

  /** Table state */
  sorting: SortingState;
  columnVisibility: VisibilityState;
  rowSelection: RowSelectionState;

  /** Table state setters */
  setSorting: (
    value: SortingState | ((old: SortingState) => SortingState)
  ) => void;
  setColumnVisibility: (
    value: VisibilityState | ((old: VisibilityState) => VisibilityState)
  ) => void;
  setRowSelection: (
    value: RowSelectionState | ((old: RowSelectionState) => RowSelectionState)
  ) => void;

  /** Callback when sort changes (for server-side sorting) */
  onSortChange?: (sorting: SortingState) => void;

  /** Invite user handler */
  onInviteUser: () => void;

  /** Can invite users */
  canInvite: boolean;

  /** Row click handler */
  onRowClick?: (user: User) => void;
}

export function UsersTable({
  data,
  totalCount = 0,
  currentPage,
  pageSize,
  isLoading = false,
  searchValue,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  onPageChange,
  onPageSizeChange,
  sorting,
  columnVisibility,
  rowSelection,
  setSorting,
  setColumnVisibility,
  setRowSelection,
  onSortChange,
  onInviteUser,
  canInvite,
  onRowClick,
}: UsersTableProps) {
  const router = useRouter();

  // Get columns with router instance
  const columns = useMemo(() => getUserColumns(router as any), [router]);

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);

  // Create table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: (updater) => {
      setSorting(updater);
      if (onSortChange) {
        const newSorting =
          typeof updater === "function" ? updater(sorting) : updater;
        onSortChange(newSorting);
      }
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      const current = { pageIndex: currentPage - 1, pageSize };
      const next = typeof updater === "function" ? updater(current) : updater;

      if (next.pageIndex !== current.pageIndex) {
        onPageChange(next.pageIndex + 1); // Convert back to 1-indexed
      }
      if (next.pageSize !== current.pageSize) {
        onPageSizeChange(next.pageSize);
      }
    },
    enableRowSelection: true,
    manualPagination: true,
    manualSorting: true,
    pageCount: totalPages,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: currentPage - 1, // TanStack uses 0-indexed
        pageSize,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <UsersToolbar
        table={table}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        roleFilter={roleFilter}
        onRoleFilterChange={onRoleFilterChange}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
        onInviteUser={onInviteUser}
        canInvite={canInvite}
      />

      {/* Table */}
      <DataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No users found."
        onRowClick={onRowClick}
      />

      {/* Pagination */}
      <DataTablePagination
        table={table}
        pageSizeOptions={[10, 20, 30, 50, 100]}
      />
    </div>
  );
}
