import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Candidate,
  OverallStatus,
  InterviewStatus,
  PopulatedUser,
  Gender,
} from "@/types/candidateTypes";

interface ProfileDetailsTabProps {
  candidate: Candidate;
}

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
 * Format overall status for display
 */
const formatOverallStatus = (status: OverallStatus): string => {
  const statusMap: Record<OverallStatus, string> = {
    [OverallStatus.NEW]: "New",
    [OverallStatus.ASSIGNED]: "Assigned",
    [OverallStatus.ATTEMPTING]: "Attempting",
    [OverallStatus.SCHEDULED]: "Scheduled",
    [OverallStatus.INTERVIEWED]: "Interviewed",
    [OverallStatus.REPORT_GENERATED]: "Report Generated",
    [OverallStatus.DROPPED]: "Dropped",
  };
  return statusMap[status] || status;
};

/**
 * Format interview status for display
 */
const formatInterviewStatus = (status: InterviewStatus): string => {
  const statusMap: Record<InterviewStatus, string> = {
    [InterviewStatus.NOT_STARTED]: "Not Started",
    [InterviewStatus.SCHEDULED]: "Scheduled",
    [InterviewStatus.IN_PROGRESS]: "In Progress",
    [InterviewStatus.COMPLETED]: "Completed",
    [InterviewStatus.CANCELLED]: "Cancelled",
    [InterviewStatus.NO_SHOW]: "No Show",
    [InterviewStatus.RESCHEDULED]: "Rescheduled",
  };
  return statusMap[status] || status;
};

/**
 * Format gender for display
 */
const formatGender = (gender: Gender): string => {
  const genderMap: Record<Gender, string> = {
    [Gender.MALE]: "Male",
    [Gender.FEMALE]: "Female",
    [Gender.OTHER]: "Other",
  };
  return genderMap[gender] || gender;
};

/**
 * Get user display name
 */
const getUserDisplayName = (user: string | PopulatedUser | undefined): string => {
  if (!user) return "Not Assigned";
  if (typeof user === "string") return "Unknown";
  return `${user.firstName} ${user.lastName}`;
};

/**
 * Field row component for consistent display
 */
const FieldRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col gap-1">
    <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
    <dd className="text-sm">{value || "-"}</dd>
  </div>
);

export function ProfileDetailsTab({ candidate }: ProfileDetailsTabProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4">
            <FieldRow label="Full Name" value={candidate.name} />
            <FieldRow label="Email Address" value={candidate.email} />
            <FieldRow label="Contact Number" value={candidate.contactNumber} />
            <FieldRow
              label="Date of Birth"
              value={format(new Date(candidate.dob), "MMM dd, yyyy")}
            />
            <FieldRow label="Age" value={`${candidate.age} years`} />
            <FieldRow label="Gender" value={formatGender(candidate.gender)} />
          </dl>
        </CardContent>
      </Card>

      {/* Employment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Employment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4">
            <FieldRow label="Designation" value={candidate.designation} />
            <FieldRow label="Department" value={candidate.department} />
            <FieldRow label="Grade Level" value={candidate.gradeLevel} />
            <FieldRow
              label="Nature of Employment"
              value={candidate.natureOfEmployment}
            />
            <FieldRow label="Location" value={candidate.location} />
            <FieldRow label="Reporting To" value={candidate.reportingTo} />
          </dl>
        </CardContent>
      </Card>

      {/* Tenure Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tenure Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4">
            <FieldRow
              label="Date of Joining"
              value={format(new Date(candidate.dateOfJoining), "MMM dd, yyyy")}
            />
            <FieldRow
              label="Experience in Organization"
              value={`${candidate.experienceInOrg} years`}
            />
          </dl>
        </CardContent>
      </Card>

      {/* Exit Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Exit Information</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4">
            <FieldRow
              label="Resignation Date"
              value={format(new Date(candidate.resignationDate), "MMM dd, yyyy")}
            />
            <FieldRow
              label="Last Working Day"
              value={format(new Date(candidate.lastWorkingDay), "MMM dd, yyyy")}
            />
            <FieldRow label="Quarter" value={candidate.quarter} />
          </dl>
        </CardContent>
      </Card>

      {/* Assignment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Assignment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4">
            <FieldRow
              label="Assigned Interviewer"
              value={getUserDisplayName(candidate.assignedInterviewer)}
            />
            <FieldRow
              label="Assigned By"
              value={getUserDisplayName(candidate.assignedBy)}
            />
            <FieldRow
              label="Uploaded By"
              value={getUserDisplayName(candidate.uploadedBy)}
            />
            <FieldRow
              label="Created At"
              value={format(new Date(candidate.createdAt), "MMM dd, yyyy HH:mm")}
            />
          </dl>
        </CardContent>
      </Card>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4">
            <FieldRow
              label="Overall Status"
              value={
                <Badge variant={getOverallStatusBadgeVariant(candidate.overallStatus)}>
                  {formatOverallStatus(candidate.overallStatus)}
                </Badge>
              }
            />
            <FieldRow
              label="Interview Status"
              value={
                <Badge
                  variant={getInterviewStatusBadgeVariant(
                    candidate.interviewDetails.status
                  )}
                >
                  {formatInterviewStatus(candidate.interviewDetails.status)}
                </Badge>
              }
            />
            {candidate.interviewDetails.scheduledDate && (
              <FieldRow
                label="Interview Scheduled"
                value={format(
                  new Date(candidate.interviewDetails.scheduledDate),
                  "MMM dd, yyyy HH:mm"
                )}
              />
            )}
            <FieldRow
              label="Active Status"
              value={
                <Badge variant={candidate.isActive ? "secondary" : "destructive"}>
                  {candidate.isActive ? "Active" : "Inactive"}
                </Badge>
              }
            />
            <FieldRow
              label="Follow-up Attempts"
              value={`${candidate.followupAttempts.length} / ${candidate.maxFollowupAttempts}`}
            />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
