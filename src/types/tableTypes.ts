import { ReactNode } from "react";
import { ColumnDef } from "@tanstack/react-table";

// ==================== QUERY OPERATORS ====================

/**
 * MongoDB-compatible query operators for search filters
 */
export interface QueryOperator {
  eq?: any; // equals
  ne?: any; // not equals
  contains?: string; // contains substring (regex)
  in?: any[]; // in array
  gte?: string | number | Date; // greater than or equal
  lte?: string | number | Date; // less than or equal
  gt?: string | number | Date; // greater than
  lt?: string | number | Date; // less than
  startsWith?: string; // starts with
  endsWith?: string; // ends with
}

/**
 * Generic search filters - dynamic keys based on entity fields
 */
export type SearchFilters<T> = {
  [K in keyof Partial<T>]?: QueryOperator | any;
};

/**
 * Sort options - 1 for ascending, -1 for descending
 */
export type SortOptions<T> = {
  [K in keyof Partial<T>]?: 1 | -1;
};

// ==================== TABLE STATE ====================

/**
 * Pagination state
 */
export interface PaginationState {
  page: number;
  limit: number;
}

/**
 * Complete table state managed by URL params
 */
export interface TableState<T> {
  pagination: PaginationState;
  sorting: SortOptions<T>;
  filters: SearchFilters<T>;
  searchText: string;
}

// ==================== BULK ACTIONS ====================

/**
 * Configuration for a single bulk action
 */
export interface BulkAction<T> {
  label: string;
  icon?: ReactNode;
  variant?: "default" | "outline" | "ghost" | "destructive";
  onClick: (selectedRows: T[]) => Promise<void> | void;
  confirm?: {
    title: string;
    description: string | ((count: number) => string);
  };
  /** Show only when condition is met */
  show?: (selectedRows: T[]) => boolean;
}

// ==================== FILTER CONFIG ====================

/**
 * Filter field configuration for toolbar
 */
export interface FilterFieldConfig<T> {
  key: keyof T;
  label: string;
  type: "checkbox" | "select" | "date-range" | "number-range";
  options?: Array<{
    label: string;
    value: any;
  }>;
}

// ==================== TOOLBAR CONFIG ====================

/**
 * Configuration for the table toolbar
 */
export interface ToolbarConfig<T> {
  searchPlaceholder?: string;
  searchFields?: (keyof T)[]; // Fields to search across
  filters?: FilterFieldConfig<T>[];
  showColumnVisibility?: boolean;
  showExport?: boolean;
  exportFilename?: string;
  customActions?: ReactNode;
}

// ==================== GENERIC TABLE PROPS ====================

/**
 * Props for GenericTable component
 */
export interface GenericTableProps<T> {
  /** Column definitions */
  columns: ColumnDef<T>[];

  /** Table data */
  data: T[];

  /** Total count for pagination */
  totalCount?: number;

  /** Loading state */
  isLoading?: boolean;

  /** Empty state message */
  emptyMessage?: string;

  /** Custom empty state component */
  emptyState?: ReactNode;

  /** Toolbar configuration */
  toolbarConfig?: ToolbarConfig<T>;

  /** Bulk actions */
  bulkActions?: BulkAction<T>[];

  /** Callback when a row is clicked */
  onRowClick?: (row: T) => void;

  /** Custom toolbar component (overrides default) */
  customToolbar?: ReactNode;

  /** Enable row selection */
  enableRowSelection?: boolean;

  /** Pagination page size options */
  pageSizeOptions?: number[];
}

// ==================== EXPORT ====================

/**
 * Export format options
 */
export type ExportFormat = "csv" | "json" | "excel";

/**
 * Export configuration
 */
export interface ExportConfig<T> {
  filename: string;
  format: ExportFormat;
  data: T[];
  columns?: (keyof T)[];
  columnLabels?: Partial<Record<keyof T, string>>;
}
