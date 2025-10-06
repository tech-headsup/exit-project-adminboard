import { useId, useRef } from "react";
import {
  CircleXIcon,
  Columns3Icon,
  FilterIcon,
  ListFilterIcon,
  PlusIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
import { UserRole } from "@/types/userTypes";

interface UsersToolbarProps {
  table: any;
  searchValue: string;
  onSearchChange: (value: string) => void;
  roleFilter: UserRole[];
  onRoleFilterChange: (value: UserRole[]) => void;
  statusFilter: boolean[];
  onStatusFilterChange: (value: boolean[]) => void;
  onInviteUser: () => void;
  canInvite: boolean;
}

const ROLE_OPTIONS = [
  { label: "Super Admin", value: UserRole.SUPERADMIN },
  { label: "Admin", value: UserRole.ADMIN },
  { label: "Executive", value: UserRole.EXECUTIVE },
  { label: "Client", value: UserRole.CLIENT },
];

const STATUS_OPTIONS = [
  { label: "Active", value: true },
  { label: "Inactive", value: false },
];

export function UsersToolbar({
  table,
  searchValue,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  statusFilter,
  onStatusFilterChange,
  onInviteUser,
  canInvite,
}: UsersToolbarProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleRoleChange = (checked: boolean, value: UserRole) => {
    const newFilter = [...roleFilter];

    if (checked) {
      if (!newFilter.includes(value)) {
        newFilter.push(value);
      }
    } else {
      const index = newFilter.indexOf(value);
      if (index > -1) {
        newFilter.splice(index, 1);
      }
    }

    onRoleFilterChange(newFilter);
  };

  const handleStatusChange = (checked: boolean, value: boolean) => {
    const newFilter = [...statusFilter];

    if (checked) {
      if (!newFilter.includes(value)) {
        newFilter.push(value);
      }
    } else {
      const index = newFilter.indexOf(value);
      if (index > -1) {
        newFilter.splice(index, 1);
      }
    }

    onStatusFilterChange(newFilter);
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
            placeholder="Search by email or name..."
            type="text"
            aria-label="Search"
          />
          <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
            <ListFilterIcon size={16} aria-hidden="true" />
          </div>
          {searchValue && (
            <button
              className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Clear filter"
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

        {/* Role Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <FilterIcon
                className="-ms-1 opacity-60"
                size={16}
                aria-hidden="true"
              />
              Role
              {roleFilter.length > 0 && (
                <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                  {roleFilter.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto min-w-36 p-3" align="start">
            <div className="space-y-3">
              <div className="text-muted-foreground text-xs font-medium">
                Filter by Role
              </div>
              <div className="space-y-3">
                {ROLE_OPTIONS.map((option, i) => (
                  <div key={option.value} className="flex items-center gap-2">
                    <Checkbox
                      id={`${id}-role-${i}`}
                      checked={roleFilter.includes(option.value)}
                      onCheckedChange={(checked: boolean) =>
                        handleRoleChange(checked, option.value)
                      }
                    />
                    <Label
                      htmlFor={`${id}-role-${i}`}
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

        {/* Status Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              <FilterIcon
                className="-ms-1 opacity-60"
                size={16}
                aria-hidden="true"
              />
              Status
              {statusFilter.length > 0 && (
                <span className="bg-background text-muted-foreground/70 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
                  {statusFilter.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto min-w-36 p-3" align="start">
            <div className="space-y-3">
              <div className="text-muted-foreground text-xs font-medium">
                Filter by Status
              </div>
              <div className="space-y-3">
                {STATUS_OPTIONS.map((option, i) => (
                  <div key={option.label} className="flex items-center gap-2">
                    <Checkbox
                      id={`${id}-status-${i}`}
                      checked={statusFilter.includes(option.value)}
                      onCheckedChange={(checked: boolean) =>
                        handleStatusChange(checked, option.value)
                      }
                    />
                    <Label
                      htmlFor={`${id}-status-${i}`}
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

        {/* Column Visibility */}
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
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Invite User */}
        {canInvite && (
          <Button onClick={onInviteUser}>
            <PlusIcon
              className="-ms-1 opacity-60"
              size={16}
              aria-hidden="true"
            />
            Invite User
          </Button>
        )}
      </div>
    </div>
  );
}
