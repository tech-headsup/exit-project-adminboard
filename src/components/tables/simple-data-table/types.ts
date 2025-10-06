import { ColumnDef, FilterFn, SortingState } from "@tanstack/react-table";
import { ReactNode } from "react";

/**
 * Filter configuration for simple data table
 */
export interface SimpleFilter<TData> {
  /** Column id to filter */
  columnId: string;
  /** Filter type */
  type: "select" | "multiselect" | "text";
  /** Label for the filter */
  label: string;
  /** Icon for the filter button */
  icon?: ReactNode;
  /** Custom filter function */
  filterFn?: FilterFn<TData>;
  /** Options for select/multiselect filters */
  options?: { label: string; value: string }[];
}

/**
 * Action button configuration
 */
export interface ActionButton {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: "default" | "outline" | "ghost" | "destructive";
}

/**
 * Bulk action configuration (shown when rows are selected)
 */
export interface BulkAction<TData> {
  label: string;
  icon?: ReactNode;
  onClick: (selectedRows: TData[]) => void | Promise<void>;
  variant?: "default" | "outline" | "ghost" | "destructive";
  /** Show confirmation dialog */
  confirmDialog?: {
    title: string;
    description: (count: number) => string;
  };
}

/**
 * Props for SimpleDataTable component
 */
export interface SimpleDataTableProps<TData> {
  /** Table data */
  data: TData[];
  /** Column definitions */
  columns: ColumnDef<TData>[];
  /** Search configuration */
  searchConfig?: {
    /** Column id to search (will use custom filterFn if provided in column def) */
    columnId: string;
    /** Placeholder text */
    placeholder?: string;
  };
  /** Additional filters */
  filters?: SimpleFilter<TData>[];
  /** Action buttons (shown on the right) */
  actions?: ActionButton[];
  /** Bulk actions (shown when rows are selected) */
  bulkActions?: BulkAction<TData>[];
  /** Show column visibility toggle */
  showColumnVisibility?: boolean;
  /** Initial page size */
  initialPageSize?: number;
  /** Initial sorting */
  initialSorting?: SortingState;
  /** Page size options */
  pageSizeOptions?: number[];
  /** Enable row selection */
  enableRowSelection?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
}
