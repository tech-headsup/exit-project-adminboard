import { useId, useRef, ReactNode } from "react";
import {
  CircleAlertIcon,
  CircleXIcon,
  Columns3Icon,
  DownloadIcon,
  FilterIcon,
  ListFilterIcon,
  TrashIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BulkAction, FilterFieldConfig } from "@/types/tableTypes";
import { exportToExcel, exportToCSV } from "./utils/exportUtils";

interface GenericToolbarProps<T> {
  /** TanStack table instance */
  table: any;

  /** Search input value */
  searchValue: string;

  /** Search input change handler */
  onSearchChange: (value: string) => void;

  /** Search placeholder text */
  searchPlaceholder?: string;

  /** Filter configurations */
  filters?: FilterFieldConfig<T>[];

  /** Current filter values */
  filterValues?: Record<string, any>;

  /** Filter change handler */
  onFilterChange?: (key: string, value: any) => void;

  /** Bulk actions */
  bulkActions?: BulkAction<T>[];

  /** Show column visibility toggle */
  showColumnVisibility?: boolean;

  /** Show export button */
  showExport?: boolean;

  /** Export filename */
  exportFilename?: string;

  /** Custom actions to render */
  customActions?: ReactNode;
}

export function GenericToolbar<T extends Record<string, any>>({
  table,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  filterValues = {},
  onFilterChange,
  bulkActions = [],
  showColumnVisibility = true,
  showExport = false,
  exportFilename = "export",
  customActions,
}: GenericToolbarProps<T>) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedRows = table.getSelectedRowModel().rows;
  const hasSelectedRows = selectedRows.length > 0;

  // Handle filter change for checkbox filters
  const handleCheckboxFilterChange = (
    key: string,
    checked: boolean,
    value: any
  ) => {
    if (!onFilterChange) return;

    const currentValues = filterValues[key] || [];
    let newValues: any[];

    if (checked) {
      newValues = [...currentValues, value];
    } else {
      newValues = currentValues.filter((v: any) => v !== value);
    }

    onFilterChange(key, newValues);
  };

  // Handle export
  const handleExport = (format: "csv" | "excel") => {
    const rows = table.getFilteredRowModel().rows.map((row: any) => row.original);

    if (format === "csv") {
      exportToCSV({
        filename: exportFilename,
        data: rows,
      });
    } else {
      exportToExcel({
        filename: exportFilename,
        data: rows,
      });
    }
  };

  // Render bulk action button
  const renderBulkAction = (action: BulkAction<T>, index: number) => {
    const selectedData = selectedRows.map((row: any) => row.original);

    // Check if action should be shown
    if (action.show && !action.show(selectedData)) {
      return null;
    }

    const handleClick = async () => {
      await action.onClick(selectedData);
      table.resetRowSelection();
    };

    const button = (
      <Button
        key={index}
        variant={action.variant || "outline"}
        onClick={action.confirm ? undefined : handleClick}
      >
        {action.icon && <span className="-ms-1 opacity-60">{action.icon}</span>}
        {action.label}
        <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
          {selectedRows.length}
        </span>
      </Button>
    );

    // Wrap with confirmation dialog if needed
    if (action.confirm) {
      const description =
        typeof action.confirm.description === "function"
          ? action.confirm.description(selectedRows.length)
          : action.confirm.description;

      return (
        <AlertDialog key={index}>
          <AlertDialogTrigger asChild>{button}</AlertDialogTrigger>
          <AlertDialogContent>
            <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
              <div
                className="flex size-9 shrink-0 items-center justify-center rounded-full border"
                aria-hidden="true"
              >
                <CircleAlertIcon className="opacity-80" size={16} />
              </div>
              <AlertDialogHeader>
                <AlertDialogTitle>{action.confirm.title}</AlertDialogTitle>
                <AlertDialogDescription>{description}</AlertDialogDescription>
              </AlertDialogHeader>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleClick}>
                {action.label}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    }

    return button;
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative">
          <Input
            id={`${id}-search`}
            ref={inputRef}
            className={cn("peer min-w-60 ps-9", searchValue && "pe-9")}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            type="text"
            aria-label="Search"
          />
          <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
            <ListFilterIcon size={16} aria-hidden="true" />
          </div>
          {searchValue && (
            <button
              className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Clear search"
              onClick={() => {
                onSearchChange("");
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }}
            >
              <CircleXIcon size={16} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Filters */}
        {filters.map((filter) => {
          if (filter.type === "checkbox") {
            const activeCount = (filterValues[filter.key as string] || []).length;

            return (
              <Popover key={filter.key as string}>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <FilterIcon
                      className="-ms-1 opacity-60"
                      size={16}
                      aria-hidden="true"
                    />
                    {filter.label}
                    {activeCount > 0 && (
                      <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                        {activeCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto min-w-36 p-3" align="start">
                  <div className="space-y-3">
                    <div className="text-muted-foreground text-xs font-medium">
                      {filter.label}
                    </div>
                    <div className="space-y-3">
                      {filter.options?.map((option, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Checkbox
                            id={`${id}-${filter.key as string}-${i}`}
                            checked={(
                              filterValues[filter.key as string] || []
                            ).includes(option.value)}
                            onCheckedChange={(checked: boolean) =>
                              handleCheckboxFilterChange(
                                filter.key as string,
                                checked,
                                option.value
                              )
                            }
                          />
                          <Label
                            htmlFor={`${id}-${filter.key as string}-${i}`}
                            className="flex grow justify-between gap-2 font-normal"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            );
          }

          return null;
        })}

        {/* Column Visibility */}
        {showColumnVisibility && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Columns3Icon
                  className="-ms-1 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              {table
                .getAllColumns()
                .filter((column: any) => column.getCanHide())
                .map((column: any) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                      onSelect={(event) => event.preventDefault()}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Bulk Actions */}
        {hasSelectedRows && bulkActions.map(renderBulkAction)}

        {/* Export */}
        {showExport && !hasSelectedRows && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <DownloadIcon
                  className="-ms-1 opacity-60"
                  size={16}
                  aria-hidden="true"
                />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Export as</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                onSelect={() => handleExport("excel")}
              >
                Excel (.xlsx)
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem onSelect={() => handleExport("csv")}>
                CSV (.csv)
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Custom Actions */}
        {customActions}
      </div>
    </div>
  );
}
