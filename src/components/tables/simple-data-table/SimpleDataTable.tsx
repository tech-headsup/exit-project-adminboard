import { useDataTable } from "@/components/data-table/useDataTable";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTablePagination } from "@/components/data-table/DataTablePagination";
import { SimpleToolbar } from "./SimpleToolbar";
import { SimpleDataTableProps } from "./types";

/**
 * SimpleDataTable - A ready-to-use data table with search, filters, and actions
 * Perfect for Company, Project, and other simple entity tables with client-side filtering
 */
export function SimpleDataTable<TData>({
  data,
  columns,
  searchConfig,
  filters = [],
  actions = [],
  bulkActions = [],
  showColumnVisibility = true,
  initialPageSize = 10,
  initialSorting = [],
  pageSizeOptions = [5, 10, 25, 50],
  enableRowSelection = true,
  isLoading = false,
  emptyMessage = "No results.",
}: SimpleDataTableProps<TData>) {
  const { table } = useDataTable({
    data,
    columns,
    initialPageSize,
    initialSorting,
    enableRowSelection,
    enableMultiRowSelection: true,
  });

  return (
    <div className="space-y-4">
      {/* Toolbar with search, filters, and actions */}
      <SimpleToolbar
        table={table}
        searchConfig={searchConfig}
        filters={filters}
        actions={actions}
        bulkActions={bulkActions}
        showColumnVisibility={showColumnVisibility}
      />

      {/* Table */}
      <DataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
      />

      {/* Pagination */}
      <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
    </div>
  );
}
