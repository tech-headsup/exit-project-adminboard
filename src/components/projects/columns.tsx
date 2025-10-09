import { ColumnDef } from "@tanstack/react-table";
import { FilePenLine, BriefcaseIcon, Users } from "lucide-react";
import { NextRouter } from "next/router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Project,
  ProjectType,
  ProjectStatus,
  PopulatedCompany,
} from "@/types/projectTypes";
import { format } from "date-fns";

/**
 * Multi-column filter function for searching across project name and company name
 */
const multiColumnFilterFn = (
  row: any,
  columnId: string,
  filterValue: string
) => {
  const project = row.original;
  const companyName =
    typeof project.companyId === "object"
      ? (project.companyId as PopulatedCompany).nameOfCompany
      : "";

  const searchableFields = [project.projectName, companyName];

  return searchableFields.some((field) =>
    field?.toLowerCase().includes(filterValue.toLowerCase())
  );
};

/**
 * Get badge variant for project type
 */
const getProjectTypeBadgeVariant = (type: ProjectType) => {
  switch (type) {
    case ProjectType.EXIT:
      return "destructive";
    case ProjectType.OFFER_DROPOUT:
      return "default";
    case ProjectType.STAY:
      return "secondary";
    default:
      return "outline";
  }
};

/**
 * Get badge variant for project status
 */
const getProjectStatusBadgeVariant = (status: ProjectStatus) => {
  switch (status) {
    case ProjectStatus.PLANNING:
      return "outline";
    case ProjectStatus.IN_PROGRESS:
      return "default";
    case ProjectStatus.COMPLETED:
      return "secondary";
    case ProjectStatus.ON_HOLD:
      return "destructive";
    default:
      return "outline";
  }
};

/**
 * Format project type for display
 */
const formatProjectType = (type: ProjectType): string => {
  switch (type) {
    case ProjectType.EXIT:
      return "Exit";
    case ProjectType.OFFER_DROPOUT:
      return "Offer Dropout";
    case ProjectType.STAY:
      return "Stay";
    default:
      return type;
  }
};

/**
 * Format project status for display
 */
const formatProjectStatus = (status: ProjectStatus): string => {
  switch (status) {
    case ProjectStatus.PLANNING:
      return "Planning";
    case ProjectStatus.IN_PROGRESS:
      return "In Progress";
    case ProjectStatus.COMPLETED:
      return "Completed";
    case ProjectStatus.ON_HOLD:
      return "On Hold";
    default:
      return status;
  }
};

/**
 * Project table column definitions
 */
export const getProjectColumns = (router: NextRouter): ColumnDef<Project>[] => [
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
    accessorKey: "companyId",
    cell: ({ row }) => {
      const company = row.original.companyId;
      const companyName =
        typeof company === "object"
          ? (company as PopulatedCompany).nameOfCompany
          : "";

      return (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
            <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="font-medium">{companyName || "-"}</div>
        </div>
      );
    },
    size: 150,
    filterFn: multiColumnFilterFn,
    enableHiding: false,
  },
  {
    header: "Project Name",
    accessorKey: "projectName",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("projectName")}</div>
    ),
    size: 150,
    enableHiding: false,
  },
  {
    header: "Project Type",
    accessorKey: "projectType",
    cell: ({ row }) => {
      const type = row.getValue("projectType") as ProjectType;
      return (
        <Badge variant={getProjectTypeBadgeVariant(type)}>
          {formatProjectType(type)}
        </Badge>
      );
    },
    size: 100,
  },
  {
    header: "Status",
    accessorKey: "projectStatus",
    cell: ({ row }) => {
      const status = row.getValue("projectStatus") as ProjectStatus;
      return (
        <Badge variant={getProjectStatusBadgeVariant(status)}>
          {formatProjectStatus(status)}
        </Badge>
      );
    },
    size: 100,
  },
  {
    header: "No. of Employees",
    accessorKey: "noOfEmployees",
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("noOfEmployees")}</div>
    ),
    size: 140,
  },
  {
    header: "HeadsUp SPOCs",
    accessorKey: "headsUpSpocIds",
    cell: ({ row }) => {
      const spocs = row.original.headsUpSpocIds;
      const count = Array.isArray(spocs) ? spocs.length : 0;

      if (count === 0) {
        return <span className="text-muted-foreground">-</span>;
      }

      return (
        <Badge variant="outline">
          {count} {count === 1 ? "SPOC" : "SPOCs"}
        </Badge>
      );
    },
    size: 140,
  },
  {
    header: "Client SPOCs",
    accessorKey: "clientSpocIds",
    cell: ({ row }) => {
      const spocs = row.original.clientSpocIds;
      const count = Array.isArray(spocs) ? spocs.length : 0;

      if (count === 0) {
        return <span className="text-muted-foreground">-</span>;
      }

      return (
        <Badge variant="outline">
          {count} {count === 1 ? "SPOC" : "SPOCs"}
        </Badge>
      );
    },
    size: 140,
  },
  {
    header: "Created Date",
    accessorKey: "createdAt",
    cell: ({ row }) => {
      const date = row.getValue("createdAt");
      return date ? format(new Date(date as Date), "MMM dd, yyyy") : "-";
    },
    size: 140,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/projects/${row.original._id}/candidates`);
          }}
          title="View Candidates"
        >
          <Users className="h-4 w-4" />
          <span className="sr-only">View Candidates</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/projects/${row.original._id}`);
          }}
          title="Edit Project"
        >
          <FilePenLine className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
      </div>
    ),
    size: 100,
    enableHiding: false,
  },
];
