import { ColumnDef } from "@tanstack/react-table";
import { Eye, UserCircle2 } from "lucide-react";
import { NextRouter } from "next/router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Candidate,
  OverallStatus,
  InterviewStatus,
  CallStatus,
  PopulatedUser,
} from "@/types/candidateTypes";

/**
 * Get badge variant for overall status
 */
const getOverallStatusBadgeVariant = (status: OverallStatus) => {
  switch (status) {
    case OverallStatus.NEW:
      return "outline";
    case OverallStatus.ASSIGNED:
      return "secondary";
    case OverallStatus.ATTEMPTING:
      return "default";
    case OverallStatus.SCHEDULED:
      return "default";
    case OverallStatus.INTERVIEWED:
      return "secondary";
    case OverallStatus.REPORT_GENERATED:
      return "secondary";
    case OverallStatus.DROPPED:
      return "destructive";
    default:
      return "outline";
  }
};

/**
 * Get badge variant for interview status
 */
const getInterviewStatusBadgeVariant = (status: InterviewStatus) => {
  switch (status) {
    case InterviewStatus.NOT_STARTED:
      return "outline";
    case InterviewStatus.SCHEDULED:
      return "default";
    case InterviewStatus.IN_PROGRESS:
      return "default";
    case InterviewStatus.COMPLETED:
      return "secondary";
    case InterviewStatus.CANCELLED:
      return "destructive";
    case InterviewStatus.NO_SHOW:
      return "destructive";
    case InterviewStatus.RESCHEDULED:
      return "outline";
    default:
      return "outline";
  }
};

/**
 * Get badge variant for call status
 */
const getCallStatusBadgeVariant = (status: CallStatus) => {
  switch (status) {
    case CallStatus.ANSWERED_AGREED:
      return "secondary";
    case CallStatus.ANSWERED_DECLINED:
      return "destructive";
    case CallStatus.NOT_ANSWERING:
      return "outline";
    case CallStatus.WRONG_NUMBER:
      return "destructive";
    case CallStatus.SWITCHED_OFF:
      return "outline";
    case CallStatus.BUSY:
      return "outline";
    case CallStatus.CALLBACK_REQUESTED:
      return "default";
    default:
      return "outline";
  }
};

/**
 * Format overall status for display
 */
const formatOverallStatus = (status: OverallStatus): string => {
  switch (status) {
    case OverallStatus.NEW:
      return "New";
    case OverallStatus.ASSIGNED:
      return "Assigned";
    case OverallStatus.ATTEMPTING:
      return "Attempting";
    case OverallStatus.SCHEDULED:
      return "Scheduled";
    case OverallStatus.INTERVIEWED:
      return "Interviewed";
    case OverallStatus.REPORT_GENERATED:
      return "Report Generated";
    case OverallStatus.DROPPED:
      return "Dropped";
    default:
      return status;
  }
};

/**
 * Format interview status for display
 */
const formatInterviewStatus = (status: InterviewStatus): string => {
  switch (status) {
    case InterviewStatus.NOT_STARTED:
      return "Not Started";
    case InterviewStatus.SCHEDULED:
      return "Scheduled";
    case InterviewStatus.IN_PROGRESS:
      return "In Progress";
    case InterviewStatus.COMPLETED:
      return "Completed";
    case InterviewStatus.CANCELLED:
      return "Cancelled";
    case InterviewStatus.NO_SHOW:
      return "No Show";
    case InterviewStatus.RESCHEDULED:
      return "Rescheduled";
    default:
      return status;
  }
};

/**
 * Format call status for display
 */
const formatCallStatus = (status: CallStatus): string => {
  switch (status) {
    case CallStatus.ANSWERED_AGREED:
      return "Agreed";
    case CallStatus.ANSWERED_DECLINED:
      return "Declined";
    case CallStatus.NOT_ANSWERING:
      return "Not Answering";
    case CallStatus.WRONG_NUMBER:
      return "Wrong Number";
    case CallStatus.SWITCHED_OFF:
      return "Switched Off";
    case CallStatus.BUSY:
      return "Busy";
    case CallStatus.CALLBACK_REQUESTED:
      return "Callback Requested";
    default:
      return status;
  }
};

/**
 * Candidate table column definitions
 */
export const getCandidateColumns = (
  router: NextRouter,
  projectId: string
): ColumnDef<Candidate>[] => [
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
    header: "Name",
    accessorKey: "name",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <UserCircle2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.email}
            </div>
          </div>
        </div>
      );
    },
    size: 200,
    enableHiding: false,
  },
  {
    header: "Contact",
    accessorKey: "contactNumber",
    cell: ({ row }) => (
      <div className="text-sm">{row.original.contactNumber}</div>
    ),
    size: 120,
  },
  {
    header: "Designation",
    accessorKey: "designation",
    cell: ({ row }) => <div className="text-sm">{row.original.designation}</div>,
    size: 150,
  },
  {
    header: "Department",
    accessorKey: "department",
    cell: ({ row }) => <div className="text-sm">{row.original.department}</div>,
    size: 130,
  },
  {
    header: "Assigned Interviewer",
    accessorKey: "assignedInterviewer",
    cell: ({ row }) => {
      const interviewer = row.original.assignedInterviewer;

      if (!interviewer) {
        return <span className="text-muted-foreground text-sm">Unassigned</span>;
      }

      if (typeof interviewer === "object") {
        const user = interviewer as PopulatedUser;
        return (
          <div className="text-sm">
            {user.firstName} {user.lastName}
          </div>
        );
      }

      return <span className="text-muted-foreground text-sm">-</span>;
    },
    size: 150,
  },
  {
    header: "Overall Status",
    accessorKey: "overallStatus",
    cell: ({ row }) => {
      const status = row.original.overallStatus;
      return (
        <Badge variant={getOverallStatusBadgeVariant(status)}>
          {formatOverallStatus(status)}
        </Badge>
      );
    },
    size: 130,
  },
  {
    header: "Interview Status",
    accessorKey: "interviewDetails.status",
    cell: ({ row }) => {
      const status = row.original.interviewDetails.status;
      return (
        <Badge variant={getInterviewStatusBadgeVariant(status)}>
          {formatInterviewStatus(status)}
        </Badge>
      );
    },
    size: 130,
  },
  {
    header: "Last Call Status",
    accessorKey: "followupAttempts",
    cell: ({ row }) => {
      const attempts = row.original.followupAttempts;

      if (!attempts || attempts.length === 0) {
        return <span className="text-muted-foreground text-sm">No attempts</span>;
      }

      const lastAttempt = attempts[attempts.length - 1];
      return (
        <Badge variant={getCallStatusBadgeVariant(lastAttempt.callStatus)}>
          {formatCallStatus(lastAttempt.callStatus)}
        </Badge>
      );
    },
    size: 140,
    enableSorting: false,
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/projects/${projectId}/candidates/${row.original._id}`);
        }}
      >
        <Eye className="h-4 w-4" />
        <span className="sr-only">View Details</span>
      </Button>
    ),
    size: 70,
    enableHiding: false,
  },
];
