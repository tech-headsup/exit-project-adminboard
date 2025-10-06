"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  VisibilityState,
  RowSelectionState,
} from "@tanstack/react-table";
import { CirclePlus } from "lucide-react";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTablePagination } from "@/components/data-table/DataTablePagination";
import { GenericToolbar } from "@/components/data-table/GenericToolbar";
import { Button } from "@/components/ui/button";
import { getProjectColumns } from "@/components/projects/columns";
import { useProjects } from "@/hooks/useProject";
import {
  Project,
  ProjectType,
  ProjectStatus,
  GetProjectsRequest,
  ProjectSearchFilters,
  ProjectSortOptions,
} from "@/types/projectTypes";

function Projects() {
  const router = useRouter();

  // State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [projectTypeFilter, setProjectTypeFilter] = useState<ProjectType[]>([]);
  const [projectStatusFilter, setProjectStatusFilter] = useState<
    ProjectStatus[]
  >([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Build query params with sorting
  const queryParams: GetProjectsRequest = useMemo(() => {
    const search: ProjectSearchFilters = {};
    const sort: ProjectSortOptions = {};

    // Handle sorting from table
    if (sorting.length > 0) {
      sorting.forEach((s) => {
        sort[s.id as keyof Project] = s.desc ? -1 : 1;
      });
    } else {
      // Default sort by createdAt descending
      sort.createdAt = -1;
    }

    if (searchText) {
      search.projectName = { contains: searchText };
    }

    if (projectTypeFilter.length > 0) {
      search.projectType = { in: projectTypeFilter };
    }

    if (projectStatusFilter.length > 0) {
      search.projectStatus = { in: projectStatusFilter };
    }

    return { page, limit, search, sort };
  }, [
    page,
    limit,
    searchText,
    projectTypeFilter,
    projectStatusFilter,
    sorting,
  ]);

  // Fetch data
  const { data, isLoading } = useProjects(queryParams);

  // Columns
  const columns = useMemo(() => getProjectColumns(router), [router]);

  // Handlers
  const handleFilterChange = (key: string, value: any) => {
    if (key === "projectType") {
      setProjectTypeFilter(value);
    } else if (key === "projectStatus") {
      setProjectStatusFilter(value);
    }
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    setPage(1);
  };

  const handleRowClick = (project: Project) => {
    router.push(`/projects/${project._id}`);
  };

  const projects = data?.data?.projects || [];
  const totalCount = data?.data?.pagination?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / limit);

  // Create table instance with sorting
  const table = useReactTable({
    data: projects,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: (updater) => {
      const current = { pageIndex: page - 1, pageSize: limit };
      const next = typeof updater === "function" ? updater(current) : updater;

      if (next.pageIndex !== current.pageIndex) {
        setPage(next.pageIndex + 1);
      }
      if (next.pageSize !== current.pageSize) {
        setLimit(next.pageSize);
        setPage(1);
      }
    },
    enableRowSelection: false,
    manualPagination: true,
    manualSorting: true,
    pageCount: totalPages,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex: page - 1,
        pageSize: limit,
      },
    },
  });

  // Toolbar with Add Project button
  const toolbar = (
    <GenericToolbar
      table={table}
      searchValue={searchText}
      onSearchChange={handleSearchChange}
      searchPlaceholder="Search by project name or company name..."
      filters={[
        {
          key: "projectType" as keyof Project,
          label: "Project Type",
          type: "checkbox",
          options: [
            { label: "Exit", value: ProjectType.EXIT },
            { label: "Offer Dropout", value: ProjectType.OFFER_DROPOUT },
            { label: "Stay", value: ProjectType.STAY },
          ],
        },
        {
          key: "projectStatus" as keyof Project,
          label: "Status",
          type: "checkbox",
          options: [
            { label: "Planning", value: ProjectStatus.PLANNING },
            { label: "In Progress", value: ProjectStatus.IN_PROGRESS },
            { label: "Completed", value: ProjectStatus.COMPLETED },
            { label: "On Hold", value: ProjectStatus.ON_HOLD },
          ],
        },
      ]}
      filterValues={{
        projectType: projectTypeFilter,
        projectStatus: projectStatusFilter,
      }}
      onFilterChange={handleFilterChange}
      bulkActions={[]}
      showColumnVisibility={true}
      showExport={false}
      customActions={
        <Button onClick={() => router.push("/projects/create")}>
          <CirclePlus className="-ms-1 me-2 opacity-60" size={16} />
          Add Project
        </Button>
      }
    />
  );

  return (
    <div className="container mx-auto py-6 px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground mt-2">
          Manage and track all your projects
        </p>
      </div>

      <div className="space-y-4">
        {toolbar}
        <DataTable
          table={table}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No projects found."
          onRowClick={handleRowClick}
        />
        <DataTablePagination
          table={table}
          pageSizeOptions={[10, 20, 30, 50, 100]}
        />
      </div>
    </div>
  );
}

export default Projects;
