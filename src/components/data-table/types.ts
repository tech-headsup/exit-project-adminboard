import { Row } from "@tanstack/react-table";
import { ReactNode } from "react";

/**
 * Base configuration for data table actions
 */
export interface DataTableAction {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: "default" | "outline" | "ghost" | "destructive";
  show?: boolean;
}

/**
 * Configuration for bulk actions (actions that appear when rows are selected)
 */
export interface DataTableBulkAction<TData> {
  label: string;
  icon?: ReactNode;
  onClick: (selectedRows: Row<TData>[]) => void;
  variant?: "default" | "outline" | "ghost" | "destructive";
  confirmDialog?: {
    title: string;
    description: string;
  };
}

/**
 * Configuration for table toolbar
 */
export interface DataTableToolbarConfig<TData> {
  searchPlaceholder?: string;
  searchColumn?: string;
  actions?: DataTableAction[];
  bulkActions?: DataTableBulkAction<TData>[];
  showColumnVisibility?: boolean;
}

/**
 * Configuration for pagination
 */
export interface PaginationConfig {
  pageSize: number;
  pageSizeOptions?: number[];
}

/**
 * Props for the core DataTable component
 */
export interface DataTableProps<TData> {
  /**
   * The table instance from useReactTable
   */
  table: any; // TanStack table instance

  /**
   * Column definitions
   */
  columns: any[]; // ColumnDef<TData>[]

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Empty state message
   */
  emptyMessage?: string;

  /**
   * Custom empty state component
   */
  emptyState?: ReactNode;

  /**
   * Callback when a row is clicked
   */
  onRowClick?: (row: TData) => void;
}

/**
 * Props for DataTablePagination component
 */
export interface DataTablePaginationProps {
  table: any;
  pageSizeOptions?: number[];
}
