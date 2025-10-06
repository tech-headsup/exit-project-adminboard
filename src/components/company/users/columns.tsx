import { ColumnDef } from "@tanstack/react-table";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { User, UserRole } from "@/types/userTypes";
import { formatDistanceToNow } from "date-fns";
import { get } from "http";

/**
 * Multi-column filter function for searching across name and email
 */
const multiColumnFilterFn = (
  row: any,
  columnId: string,
  filterValue: string
) => {
  const searchableFields = [
    row.original.firstName,
    row.original.lastName,
    row.original.email,
    row.original.role,
  ];

  return searchableFields.some((field) =>
    field?.toLowerCase().includes(filterValue.toLowerCase())
  );
};

/**
 * Format last login date
 */
const formatLastLogin = (lastLogin?: string) => {
  if (!lastLogin) return "Never";
  try {
    return formatDistanceToNow(new Date(lastLogin), { addSuffix: true });
  } catch {
    return "Invalid date";
  }
};

/**
 * User table column definitions
 */
export const getUserColumns = (
  router: AppRouterInstance
): ColumnDef<User>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 28,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="font-medium">
        {" "}
        {(row.getValue("email") as string).slice(0, 20)}...
      </div>
    ),
    filterFn: multiColumnFilterFn,
    size: 180,
  },
  {
    accessorKey: "firstName",
    header: "First Name",
    cell: ({ row }) => <div>{row.getValue("firstName")}</div>,
    size: 110,
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
    cell: ({ row }) => <div>{row.getValue("lastName")}</div>,
    size: 110,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as UserRole;
      const roleColors = {
        [UserRole.SUPERADMIN]:
          "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
        [UserRole.ADMIN]:
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        [UserRole.EXECUTIVE]:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        [UserRole.CLIENT]:
          "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
      };

      return (
        <Badge className={roleColors[role] || ""} variant="secondary">
          {role}
        </Badge>
      );
    },
    size: 110,
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive");
      return (
        <Badge variant={isActive ? "isActive" : "notActive"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
    size: 110,
  },
  {
    accessorKey: "isEmailVerified",
    header: "Email Verified",
    cell: ({ row }) => {
      const isVerified = row.getValue("isEmailVerified");
      return (
        <Badge variant={isVerified ? "isVerified" : "notVerified"}>
          {isVerified ? "Verified" : "Unverified"}
        </Badge>
      );
    },
    size: 110,
  },
  {
    accessorKey: "isInvited",
    header: "Type",
    cell: ({ row }) => {
      const isInvited = row.original.isInvited;
      return (
        <Badge variant="outline">{isInvited ? "Invited" : "Registered"}</Badge>
      );
    },
    size: 110,
  },
  {
    accessorKey: "lastLogin",
    header: "Last Login",
    cell: ({ row }) => {
      const lastLogin = row.original.lastLogin;
      return (
        <div className="text-sm text-muted-foreground">
          {formatLastLogin(lastLogin)}
        </div>
      );
    },
  },
  {
    accessorKey: "invitedBy",
    header: "Invited By",
    cell: ({ row }) => {
      const invitedBy = row.original.invitedBy;

      // Check if invitedBy is populated object or just string ID
      if (!invitedBy)
        return <div className="text-sm text-muted-foreground">-</div>;

      if (typeof invitedBy === "string") {
        return <div className="text-sm text-muted-foreground">{invitedBy}</div>;
      }

      // It's a populated object - show first name + last name
      return (
        <div className="text-sm text-muted-foreground">
          {invitedBy.firstName} {invitedBy.lastName}
        </div>
      );
    },
  },
];
