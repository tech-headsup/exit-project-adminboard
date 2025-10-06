// import { useId, useMemo, useRef } from "react";
// import {
//   CircleAlertIcon,
//   CircleXIcon,
//   Columns3Icon,
//   FilterIcon,
//   ListFilterIcon,
// } from "lucide-react";
// import { cn } from "@/lib/utils";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuLabel,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { ActionButton, BulkAction, SimpleFilter } from "./types";

// interface SimpleToolbarProps<TData> {
//   table: any;
//   searchConfig?: {
//     columnId: string;
//     placeholder?: string;
//   };
//   filters?: SimpleFilter<TData>[];
//   actions?: ActionButton[];
//   bulkActions?: BulkAction<TData>[];
//   showColumnVisibility?: boolean;
// }

// export function SimpleToolbar<TData>({
//   table,
//   searchConfig,
//   filters = [],
//   actions = [],
//   bulkActions = [],
//   showColumnVisibility = true,
// }: SimpleToolbarProps<TData>) {
//   const id = useId();
//   const inputRef = useRef<HTMLInputElement>(null);
//   const selectedRows = table.getSelectedRowModel().rows;

//   return (
//     <div className="flex flex-wrap items-center justify-between gap-3">
//       <div className="flex items-center gap-3">
//         {/* Search Input */}
//         {searchConfig && (
//           <div className="relative">
//             <Input
//               id={`${id}-search`}
//               ref={inputRef}
//               className={cn(
//                 "peer min-w-60 ps-9",
//                 Boolean(
//                   table.getColumn(searchConfig.columnId)?.getFilterValue()
//                 ) && "pe-9"
//               )}
//               value={
//                 (table
//                   .getColumn(searchConfig.columnId)
//                   ?.getFilterValue() as string) ?? ""
//               }
//               onChange={(e) =>
//                 table
//                   .getColumn(searchConfig.columnId)
//                   ?.setFilterValue(e.target.value)
//               }
//               placeholder={searchConfig.placeholder || "Search..."}
//               type="text"
//               aria-label={searchConfig.placeholder || "Search"}
//             />
//             <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
//               <ListFilterIcon size={16} aria-hidden="true" />
//             </div>
//             {Boolean(
//               table.getColumn(searchConfig.columnId)?.getFilterValue()
//             ) && (
//               <button
//                 className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
//                 aria-label="Clear filter"
//                 onClick={() => {
//                   table.getColumn(searchConfig.columnId)?.setFilterValue("");
//                   if (inputRef.current) {
//                     inputRef.current.focus();
//                   }
//                 }}
//               >
//                 <CircleXIcon size={16} aria-hidden="true" />
//               </button>
//             )}
//           </div>
//         )}

//         {/* Custom Filters */}
//         {filters.map((filter) => (
//           <FilterPopover
//             key={filter.columnId}
//             table={table}
//             filter={filter}
//             id={id}
//           />
//         ))}

//         {/* Column Visibility */}
//         {showColumnVisibility && (
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline">
//                 <Columns3Icon
//                   className="-ms-1 opacity-60"
//                   size={16}
//                   aria-hidden="true"
//                 />
//                 View
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
//               {table
//                 .getAllColumns()
//                 .filter((column: any) => column.getCanHide())
//                 .map((column: any) => {
//                   return (
//                     <DropdownMenuCheckboxItem
//                       key={column.id}
//                       className="capitalize"
//                       checked={column.getIsVisible()}
//                       onCheckedChange={(value) =>
//                         column.toggleVisibility(!!value)
//                       }
//                       onSelect={(event) => event.preventDefault()}
//                     >
//                       {column.id}
//                     </DropdownMenuCheckboxItem>
//                   );
//                 })}
//             </DropdownMenuContent>
//           </DropdownMenu>
//         )}
//       </div>

//       {/* Actions */}
//       <div className="flex items-center gap-3">
//         {/* Bulk Actions */}
//         {selectedRows.length > 0 &&
//           bulkActions.map((bulkAction, index) => {
//             const handleAction = () => {
//               const data = selectedRows.map((row: any) => row.original);
//               bulkAction.onClick(data);
//               table.resetRowSelection();
//             };

//             if (bulkAction.confirmDialog) {
//               return (
//                 <AlertDialog key={index}>
//                   <AlertDialogTrigger asChild>
//                     <Button variant={bulkAction.variant || "outline"}>
//                       {bulkAction.icon}
//                       {bulkAction.label}
//                       <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
//                         {selectedRows.length}
//                       </span>
//                     </Button>
//                   </AlertDialogTrigger>
//                   <AlertDialogContent>
//                     <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
//                       <div
//                         className="flex size-9 shrink-0 items-center justify-center rounded-full border"
//                         aria-hidden="true"
//                       >
//                         <CircleAlertIcon className="opacity-80" size={16} />
//                       </div>
//                       <AlertDialogHeader>
//                         <AlertDialogTitle>
//                           {bulkAction.confirmDialog.title}
//                         </AlertDialogTitle>
//                         <AlertDialogDescription>
//                           {bulkAction.confirmDialog.description(
//                             selectedRows.length
//                           )}
//                         </AlertDialogDescription>
//                       </AlertDialogHeader>
//                     </div>
//                     <AlertDialogFooter>
//                       <AlertDialogCancel>Cancel</AlertDialogCancel>
//                       <AlertDialogAction onClick={handleAction}>
//                         {bulkAction.label}
//                       </AlertDialogAction>
//                     </AlertDialogFooter>
//                   </AlertDialogContent>
//                 </AlertDialog>
//               );
//             }

//             return (
//               <Button
//                 key={index}
//                 variant={bulkAction.variant || "outline"}
//                 onClick={handleAction}
//               >
//                 {bulkAction.icon}
//                 {bulkAction.label}
//                 <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
//                   {selectedRows.length}
//                 </span>
//               </Button>
//             );
//           })}

//         {/* Regular Actions */}
//         {actions.map((action, index) => (
//           <Button
//             key={index}
//             variant={action.variant || "outline"}
//             onClick={action.onClick}
//           >
//             {action.icon}
//             {action.label}
//           </Button>
//         ))}
//       </div>
//     </div>
//   );
// }

// // Filter Popover Component
// function FilterPopover<TData>({
//   table,
//   filter,
//   id,
// }: {
//   table: any;
//   filter: SimpleFilter<TData>;
//   id: string;
// }) {
//   const column = table.getColumn(filter.columnId);

//   if (!column) return null;

//   // Get unique values for the filter
//   const uniqueValues = useMemo(() => {
//     if (filter.options) {
//       // Use provided options
//       return filter.options.map((opt) => opt.value);
//     }
//     if (!column) return [];
//     const values = Array.from(column.getFacetedUniqueValues().keys());
//     return values.sort();
//   }, [filter.options, column?.getFacetedUniqueValues()]);

//   const statusCounts = useMemo(() => {
//     if (!column) return new Map();
//     return column.getFacetedUniqueValues();
//   }, [column?.getFacetedUniqueValues()]);

//   // Get display label for a value
//   const getLabel = (value: any) => {
//     if (filter.options) {
//       const option = filter.options.find((opt) => opt.value === value);
//       return option?.label || value;
//     }
//     return value;
//   };

//   const selectedValues = useMemo(() => {
//     const filterValue = column?.getFilterValue() as string[];
//     return filterValue ?? [];
//   }, [column?.getFilterValue()]);

//   const handleChange = (checked: boolean, value: string) => {
//     const filterValue = column?.getFilterValue() as string[];
//     const newFilterValue = filterValue ? [...filterValue] : [];

//     if (checked) {
//       newFilterValue.push(value);
//     } else {
//       const index = newFilterValue.indexOf(value);
//       if (index > -1) {
//         newFilterValue.splice(index, 1);
//       }
//     }

//     column?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
//   };

//   return (
//     <Popover>
//       <PopoverTrigger asChild>
//         <Button variant="outline">
//           {filter.icon || (
//             <FilterIcon
//               className="-ms-1 opacity-60"
//               size={16}
//               aria-hidden="true"
//             />
//           )}
//           {filter.label}
//           {selectedValues.length > 0 && (
//             <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
//               {selectedValues.length}
//             </span>
//           )}
//         </Button>
//       </PopoverTrigger>
//       <PopoverContent className="w-auto min-w-36 p-3" align="start">
//         <div className="space-y-3">
//           <div className="text-muted-foreground text-xs font-medium">
//             Filters
//           </div>
//           <div className="space-y-3">
//             {uniqueValues.map((value: any, i: number) => (
//               <div key={value} className="flex items-center gap-2">
//                 <Checkbox
//                   id={`${id}-${filter.columnId}-${i}`}
//                   checked={selectedValues.includes(value)}
//                   onCheckedChange={(checked: boolean) =>
//                     handleChange(checked, value)
//                   }
//                 />
//                 <Label
//                   htmlFor={`${id}-${filter.columnId}-${i}`}
//                   className="flex grow justify-between gap-2 font-normal"
//                 >
//                   {getLabel(value)}{" "}
//                   <span className="text-muted-foreground ms-2 text-xs">
//                     {statusCounts.get(value)}
//                   </span>
//                 </Label>
//               </div>
//             ))}
//           </div>
//         </div>
//       </PopoverContent>
//     </Popover>
//   );
// }

import { useId, useMemo, useRef } from "react";
import {
  CircleAlertIcon,
  CircleXIcon,
  Columns3Icon,
  FilterIcon,
  ListFilterIcon,
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
import { ActionButton, BulkAction, SimpleFilter } from "./types";

interface SimpleToolbarProps<TData> {
  table: any;
  searchConfig?: {
    columnId: string;
    placeholder?: string;
  };
  filters?: SimpleFilter<TData>[];
  actions?: ActionButton[];
  bulkActions?: BulkAction<TData>[];
  showColumnVisibility?: boolean;
}

export function SimpleToolbar<TData>({
  table,
  searchConfig,
  filters = [],
  actions = [],
  bulkActions = [],
  showColumnVisibility = true,
}: SimpleToolbarProps<TData>) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedRows = table.getSelectedRowModel().rows;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {/* Search Input */}
        {searchConfig && (
          <div className="relative">
            <Input
              id={`${id}-search`}
              ref={inputRef}
              className={cn(
                "peer min-w-60 ps-9",
                Boolean(
                  table.getColumn(searchConfig.columnId)?.getFilterValue()
                ) && "pe-9"
              )}
              value={
                (table
                  .getColumn(searchConfig.columnId)
                  ?.getFilterValue() as string) ?? ""
              }
              onChange={(e) =>
                table
                  .getColumn(searchConfig.columnId)
                  ?.setFilterValue(e.target.value)
              }
              placeholder={searchConfig.placeholder || "Search..."}
              type="text"
              aria-label={searchConfig.placeholder || "Search"}
            />
            <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
              <ListFilterIcon size={16} aria-hidden="true" />
            </div>
            {Boolean(
              table.getColumn(searchConfig.columnId)?.getFilterValue()
            ) && (
              <button
                className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Clear filter"
                onClick={() => {
                  table.getColumn(searchConfig.columnId)?.setFilterValue("");
                  if (inputRef.current) {
                    inputRef.current.focus();
                  }
                }}
              >
                <CircleXIcon size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        )}

        {/* Custom Filters */}
        {filters.map((filter) => (
          <FilterPopover
            key={filter.columnId}
            table={table}
            filter={filter}
            id={id}
          />
        ))}

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
        {selectedRows.length > 0 &&
          bulkActions.map((bulkAction, index) => {
            const handleAction = () => {
              const data = selectedRows.map((row: any) => row.original);
              bulkAction.onClick(data);
              table.resetRowSelection();
            };

            if (bulkAction.confirmDialog) {
              return (
                <AlertDialog key={index}>
                  <AlertDialogTrigger asChild>
                    <Button variant={bulkAction.variant || "outline"}>
                      {bulkAction.icon}
                      {bulkAction.label}
                      <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                        {selectedRows.length}
                      </span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <div className="flex flex-col gap-2 max-sm:items-center sm:flex-row sm:gap-4">
                      <div
                        className="flex size-9 shrink-0 items-center justify-center rounded-full border"
                        aria-hidden="true"
                      >
                        <CircleAlertIcon className="opacity-80" size={16} />
                      </div>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {bulkAction.confirmDialog.title}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {bulkAction.confirmDialog.description(
                            selectedRows.length
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleAction}>
                        {bulkAction.label}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              );
            }

            return (
              <Button
                key={index}
                variant={bulkAction.variant || "outline"}
                onClick={handleAction}
              >
                {bulkAction.icon}
                {bulkAction.label}
                <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                  {selectedRows.length}
                </span>
              </Button>
            );
          })}

        {/* Regular Actions */}
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || "outline"}
            onClick={action.onClick}
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

// Filter Popover Component
function FilterPopover<TData>({
  table,
  filter,
  id,
}: {
  table: any;
  filter: SimpleFilter<TData>;
  id: string;
}) {
  const column = table.getColumn(filter.columnId);

  // FIXED: Move all hooks before early return
  // Get unique values for the filter
  const uniqueValues = useMemo(() => {
    if (filter.options) {
      // Use provided options
      return filter.options.map((opt) => opt.value);
    }
    if (!column) return [];
    const values = Array.from(column.getFacetedUniqueValues().keys());
    return values.sort();
  }, [filter.options, column]);

  const statusCounts = useMemo(() => {
    if (!column) return new Map();
    return column.getFacetedUniqueValues();
  }, [column]);

  const selectedValues = useMemo(() => {
    const filterValue = column?.getFilterValue() as string[];
    return filterValue ?? [];
  }, [column]);

  // Now do early return after all hooks
  if (!column) return null;

  // Get display label for a value
  const getLabel = (value: any) => {
    if (filter.options) {
      const option = filter.options.find((opt) => opt.value === value);
      return option?.label || value;
    }
    return value;
  };

  const handleChange = (checked: boolean, value: string) => {
    const filterValue = column?.getFilterValue() as string[];
    const newFilterValue = filterValue ? [...filterValue] : [];

    if (checked) {
      newFilterValue.push(value);
    } else {
      const index = newFilterValue.indexOf(value);
      if (index > -1) {
        newFilterValue.splice(index, 1);
      }
    }

    column?.setFilterValue(newFilterValue.length ? newFilterValue : undefined);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          {filter.icon || (
            <FilterIcon
              className="-ms-1 opacity-60"
              size={16}
              aria-hidden="true"
            />
          )}
          {filter.label}
          {selectedValues.length > 0 && (
            <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
              {selectedValues.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto min-w-36 p-3" align="start">
        <div className="space-y-3">
          <div className="text-muted-foreground text-xs font-medium">
            Filters
          </div>
          <div className="space-y-3">
            {uniqueValues.map((value: any, i: number) => (
              <div key={value} className="flex items-center gap-2">
                <Checkbox
                  id={`${id}-${filter.columnId}-${i}`}
                  checked={selectedValues.includes(value)}
                  onCheckedChange={(checked: boolean) =>
                    handleChange(checked, value)
                  }
                />
                <Label
                  htmlFor={`${id}-${filter.columnId}-${i}`}
                  className="flex grow justify-between gap-2 font-normal"
                >
                  {getLabel(value)}{" "}
                  <span className="text-muted-foreground ms-2 text-xs">
                    {statusCounts.get(value)}
                  </span>
                </Label>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
