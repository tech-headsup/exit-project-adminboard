import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
  SortingState,
  VisibilityState,
  RowSelectionState,
} from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTablePagination } from "@/components/data-table/DataTablePagination";
import { CompaniesToolbar } from "@/components/CompaniesComponents/CompaniesToolbar";
import { getCompanyColumns } from "./columns";
import { Company } from "@/types/companyTypes";
import { BulkAction } from "@/types/tableTypes";
import { useDeleteCompany } from "@/hooks/useCompany";

interface CompaniesTableProps {
  /** Company data */
  data: Company[];

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
}

export function CompaniesTable({
  data,
  totalCount = 0,
  currentPage,
  pageSize,
  isLoading = false,
  searchValue,
  onSearchChange,
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
}: CompaniesTableProps) {
  const router = useRouter();
  const deleteCompany = useDeleteCompany();

  // Get columns with router instance
  const columns = useMemo(() => getCompanyColumns(router), [router]);

  // Bulk actions
  const bulkActions: BulkAction<Company>[] = useMemo(
    () => [
      {
        label: "Delete",
        variant: "destructive",
        onClick: async (selectedRows) => {
          try {
            // Delete all selected companies
            await Promise.all(
              selectedRows.map((company) =>
                deleteCompany.mutateAsync({ id: company._id })
              )
            );

            // Success - companies deleted
            console.log(
              `${selectedRows.length} companies deleted successfully`
            );
          } catch (error) {
            // Error - failed to delete
            console.error("Failed to delete companies:", error);
          }
        },
        confirm: {
          title: "Are you absolutely sure?",
          description: (count: number) =>
            `This action cannot be undone. This will permanently delete ${count} selected ${
              count === 1 ? "company" : "companies"
            }.`,
        },
      },
    ],
    [deleteCompany]
  );

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

  // Handle row click
  const handleRowClick = (company: Company) => {
    router.push(`/companies/${company._id}`);
  };

  // Handle add company
  const handleAddCompany = () => {
    router.push("/companies/create");
  };

  // Handle delete selected rows
  const handleDeleteRows = async (selectedRows: Company[]) => {
    const bulkDeleteAction = bulkActions[0];
    if (bulkDeleteAction) {
      await bulkDeleteAction.onClick(selectedRows);
      setRowSelection({});
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <CompaniesToolbar
        table={table}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
        onAddCompany={handleAddCompany}
        onDeleteRows={handleDeleteRows}
      />

      {/* Table */}
      <DataTable
        table={table}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No companies found."
        onRowClick={handleRowClick}
      />

      {/* Pagination */}
      <DataTablePagination
        table={table}
        pageSizeOptions={[10, 20, 30, 50, 100]}
      />
    </div>
  );
}
