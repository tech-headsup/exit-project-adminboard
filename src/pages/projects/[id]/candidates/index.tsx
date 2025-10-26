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
import { DataTable } from "@/components/data-table/DataTable";
import { DataTablePagination } from "@/components/data-table/DataTablePagination";
import { GenericToolbar } from "@/components/data-table/GenericToolbar";
import { getCandidateColumns } from "@/components/candidates/columns";
import { useCandidates } from "@/hooks/useCandidate";
import {
  Candidate,
  OverallStatus,
  GetCandidatesRequest,
  CandidateSearchFilters,
  CandidateSortOptions,
} from "@/types/candidateTypes";

function Candidates() {
  const router = useRouter();
  const { id: projectId } = router.query;

  // State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [overallStatusFilter, setOverallStatusFilter] = useState<
    OverallStatus[]
  >([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Build query params with sorting
  const queryParams: GetCandidatesRequest = useMemo(() => {
    const search: CandidateSearchFilters = {};
    const sort: CandidateSortOptions = {};

    // Always filter by projectId (direct value, no operator)
    if (projectId && typeof projectId === "string") {
      search.projectId = projectId as any;
    }

    // Default to active candidates only (direct boolean value)
    search.isActive = true as any;

    // Handle sorting from table
    if (sorting.length > 0) {
      sorting.forEach((s) => {
        sort[s.id as keyof Candidate] = s.desc ? -1 : 1;
      });
    } else {
      // Default sort by createdAt descending
      sort.createdAt = -1;
    }

    // Search by name or email (using MongoDB $regex operator)
    if (searchText) {
      search.name = { $regex: searchText, $options: "i" } as any;
    }

    // Filter by overall status (using MongoDB $in operator)
    if (overallStatusFilter.length > 0) {
      search.overallStatus = { $in: overallStatusFilter };
    }

    return { page, limit, search, sort };
  }, [
    page,
    limit,
    projectId,
    searchText,
    overallStatusFilter,
    sorting,
  ]);

  // Fetch data
  const { data, isLoading } = useCandidates(queryParams);

  // Columns
  const columns = useMemo(
    () =>
      projectId && typeof projectId === "string"
        ? getCandidateColumns(router, projectId)
        : [],
    [router, projectId]
  );

  // Handlers
  const handleFilterChange = (key: string, value: any) => {
    if (key === "overallStatus") {
      setOverallStatusFilter(value);
    }
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    setPage(1);
  };

  const handleRowClick = (candidate: Candidate) => {
    router.push(`/projects/${projectId}/candidates/${candidate._id}`);
  };

  const candidates = data?.data?.candidates || [];
  const totalCount = data?.data?.pagination?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / limit);

  // Create table instance with sorting
  const table = useReactTable({
    data: candidates,
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

  // Toolbar with filters
  const toolbar = (
    <GenericToolbar
      table={table}
      searchValue={searchText}
      onSearchChange={handleSearchChange}
      searchPlaceholder="Search by name or email..."
      filters={[
        {
          key: "overallStatus" as keyof Candidate,
          label: "Overall Status",
          type: "checkbox",
          options: [
            { label: "New", value: OverallStatus.NEW },
            { label: "Assigned", value: OverallStatus.ASSIGNED },
            { label: "Attempting", value: OverallStatus.ATTEMPTING },
            { label: "Scheduled", value: OverallStatus.SCHEDULED },
            { label: "Interviewed", value: OverallStatus.INTERVIEWED },
            {
              label: "Report Generated",
              value: OverallStatus.REPORT_GENERATED,
            },
            { label: "Dropped", value: OverallStatus.DROPPED },
          ],
        },
      ]}
      filterValues={{
        overallStatus: overallStatusFilter,
      }}
      onFilterChange={handleFilterChange}
      bulkActions={[]}
      showColumnVisibility={true}
      showExport={false}
    />
  );

  // Show loading or error if projectId is not available
  if (!projectId) {
    return (
      <div className="container mx-auto py-6 px-8">
        <div className="text-center text-muted-foreground">
          Loading project...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Candidates</h1>
        <p className="text-muted-foreground mt-2">
          Manage and track all candidates for this project
        </p>
      </div>

      <div className="space-y-4">
        {toolbar}
        <DataTable
          table={table}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No candidates found."
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

export default Candidates;
