import { ColumnDef } from "@tanstack/react-table";
import { BuildingIcon, FilePenLine } from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Company } from "@/types/companyTypes";
import { API_BASE_URL, API_ENDPOINTS } from "@/constant/apiEnpoints";

/**
 * Multi-column filter function for searching across name, email, and industry
 */
const multiColumnFilterFn = (
  row: any,
  columnId: string,
  filterValue: string
) => {
  const searchableFields = [
    row.original.nameOfCompany,
    row.original.companyEmail,
    row.original.industry,
  ];

  return searchableFields.some((field) =>
    field?.toLowerCase().includes(filterValue.toLowerCase())
  );
};

/**
 * Company table column definitions
 */
export const getCompanyColumns = (
  router: AppRouterInstance
): ColumnDef<Company>[] => [
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
    size: 28,
    enableSorting: false,
    enableHiding: false,
  },
  {
    header: "Company Name",
    accessorKey: "nameOfCompany",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.companyLogo ? (
          <img
            src={
              `${API_BASE_URL}${API_ENDPOINTS.STORAGE_BUCKET.RETRIEVE_PUBLIC}/${row.original.companyLogo}` ||
              "/placeholder-image.png"
            }
            alt={row.original.nameOfCompany}
            className="h-8 w-8 rounded object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
            <BuildingIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        <div className="font-medium">{row.getValue("nameOfCompany")}</div>
      </div>
    ),
    size: 180,
    filterFn: multiColumnFilterFn,
    enableHiding: false,
  },
  {
    header: "Email",
    accessorKey: "companyEmail",
    size: 220,
  },
  {
    header: "Industry",
    accessorKey: "industry",
    size: 100,
  },
  {
    header: "Size",
    accessorKey: "companySize",
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("companySize")}</Badge>
    ),
    size: 100,
  },
  {
    header: "Contact",
    accessorKey: "companyContactNo",
    size: 150,
  },
  {
    header: "Status",
    accessorKey: "isActive",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "default" : "destructive"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
    size: 100,
  },
  // {
  //   header: "Website",
  //   accessorKey: "companyWebsiteURL",
  //   cell: ({ row }) => {
  //     const url = row.getValue("companyWebsiteURL") as string;
  //     return url ? (
  //       <a
  //         href={url}
  //         target="_blank"
  //         rel="noopener noreferrer"
  //         className="text-primary hover:underline"
  //         onClick={(e) => e.stopPropagation()}
  //       >
  //         Visit
  //       </a>
  //     ) : (
  //       <span className="text-muted-foreground">-</span>
  //     );
  //   },
  //   size: 100,
  // },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/companies/${row.original._id}`);
        }}
      >
        <FilePenLine className="h-4 w-4" />
        <span className="sr-only">Edit</span>
      </Button>
    ),
    size: 90,
    enableHiding: false,
  },
];
