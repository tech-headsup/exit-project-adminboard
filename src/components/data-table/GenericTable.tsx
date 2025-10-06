import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  VisibilityState,
  RowSelectionState,
} from "@tanstack/react-table";
import { DataTable } from "./DataTable";
import { DataTablePagination } from "./DataTablePagination";
import { GenericToolbar } from "./GenericToolbar";
import { GenericTableProps } from "@/types/tableTypes";

/**
 * GenericTable - A fully-featured, reusable table component
 *
 * Features:
 * - Server-side pagination
 * - Sorting
 * - Filtering
 * - Search
 * - Bulk actions
 * - Row selection
 * - Column visibility
 * - Export (CSV/Excel)
 * - Custom toolbar
 */
export function GenericTable<T extends Record<string, any>>({
  columns,
  data,
  totalCount = 0,
  isLoading = false,
  emptyMessage = "No results.",
  emptyState,
  toolbarConfig,
  bulkActions = [],
  onRowClick,
  customToolbar,
  enableRowSelection = true,
  pageSizeOptions = [10, 20, 30, 50, 100],
}: GenericTableProps<T>) {
  // State
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Memoize columns to prevent unnecessary re-renders
  const memoizedColumns = useMemo(() => columns, [columns]);

  // Create table instance
  const table = useReactTable({
    data,
    columns: memoizedColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    enableRowSelection,
    manualPagination: true, // Server-side pagination
    manualSorting: true, // Server-side sorting
    manualFiltering: true, // Server-side filtering
    pageCount: Math.ceil(totalCount / 10), // Assuming default page size of 10
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {customToolbar || (
        <GenericToolbar
          table={table}
          searchValue={toolbarConfig?.searchPlaceholder || ""}
          onSearchChange={() => {}}
          searchPlaceholder={toolbarConfig?.searchPlaceholder}
          filters={toolbarConfig?.filters}
          bulkActions={bulkActions}
          showColumnVisibility={toolbarConfig?.showColumnVisibility ?? true}
          showExport={toolbarConfig?.showExport ?? false}
          exportFilename={toolbarConfig?.exportFilename || "export"}
          customActions={toolbarConfig?.customActions}
        />
      )}

      {/* Table */}
      <DataTable
        table={table}
        columns={memoizedColumns}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        emptyState={emptyState}
        onRowClick={onRowClick}
      />

      {/* Pagination */}
      <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
    </div>
  );
}
