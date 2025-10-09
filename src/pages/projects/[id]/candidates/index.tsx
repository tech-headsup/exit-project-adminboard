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
  InterviewStatus,
  CallStatus,
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
  const [interviewStatusFilter, setInterviewStatusFilter] = useState<
    InterviewStatus[]
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

    // Default to active candidates only
    search.isActive = { $eq: true };

    // Handle sorting from table
    if (sorting.length > 0) {
      sorting.forEach((s) => {
        // Handle nested field for interview status
        if (s.id === "interviewDetails.status") {
          sort["interviewDetails.status" as any] = s.desc ? -1 : 1;
        } else {
          sort[s.id as keyof Candidate] = s.desc ? -1 : 1;
        }
      });
    } else {
      // Default sort by createdAt descending
      sort.createdAt = -1;
    }

    // Search by name or email
    if (searchText) {
      search.name = { $contains: searchText };
    }

    // Filter by overall status
    if (overallStatusFilter.length > 0) {
      search.overallStatus = { $in: overallStatusFilter };
    }

    // Filter by interview status
    if (interviewStatusFilter.length > 0) {
      search["interviewDetails.status" as any] = { $in: interviewStatusFilter };
    }

    return { page, limit, search, sort };
  }, [
    page,
    limit,
    projectId,
    searchText,
    overallStatusFilter,
    interviewStatusFilter,
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
    } else if (key === "interviewStatus") {
      setInterviewStatusFilter(value);
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
            { label: "Report Generated", value: OverallStatus.REPORT_GENERATED },
            { label: "Dropped", value: OverallStatus.DROPPED },
          ],
        },
        {
          key: "interviewStatus" as keyof Candidate,
          label: "Interview Status",
          type: "checkbox",
          options: [
            { label: "Not Started", value: InterviewStatus.NOT_STARTED },
            { label: "Scheduled", value: InterviewStatus.SCHEDULED },
            { label: "In Progress", value: InterviewStatus.IN_PROGRESS },
            { label: "Completed", value: InterviewStatus.COMPLETED },
            { label: "Cancelled", value: InterviewStatus.CANCELLED },
            { label: "No Show", value: InterviewStatus.NO_SHOW },
            { label: "Rescheduled", value: InterviewStatus.RESCHEDULED },
          ],
        },
      ]}
      filterValues={{
        overallStatus: overallStatusFilter,
        interviewStatus: interviewStatusFilter,
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
