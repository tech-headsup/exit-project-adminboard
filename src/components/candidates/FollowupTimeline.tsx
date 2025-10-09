import { format } from "date-fns";
import { Phone, Clock, User, FileText, Calendar, CheckCircle, XCircle, PhoneOff, PhoneMissed } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CallStatus,
  FollowupAttempt,
  PopulatedUser,
} from "@/types/candidateTypes";

interface FollowupTimelineProps {
  attempts: FollowupAttempt[];
}

/**
 * Get badge variant for call status with color-coded system
 */
const getCallStatusBadgeVariant = (status: CallStatus) => {
  switch (status) {
    case CallStatus.ANSWERED_AGREED:
      return "default"; // Green - Success
    case CallStatus.ANSWERED_DECLINED:
      return "destructive"; // Red - Rejected
    case CallStatus.NOT_ANSWERING:
      return "secondary"; // Gray - Neutral
    case CallStatus.WRONG_NUMBER:
      return "destructive"; // Red - Error
    case CallStatus.SWITCHED_OFF:
      return "secondary"; // Gray - Neutral
    case CallStatus.BUSY:
      return "secondary"; // Gray - Neutral
    case CallStatus.CALLBACK_REQUESTED:
      return "outline"; // Blue outline - Pending action
    default:
      return "outline";
  }
};

/**
 * Get left border color for timeline card
 */
const getTimelineCardBorderColor = (status: CallStatus): string => {
  switch (status) {
    case CallStatus.ANSWERED_AGREED:
      return "border-l-4 border-l-green-500";
    case CallStatus.ANSWERED_DECLINED:
    case CallStatus.WRONG_NUMBER:
      return "border-l-4 border-l-red-500";
    case CallStatus.CALLBACK_REQUESTED:
      return "border-l-4 border-l-blue-500";
    case CallStatus.NOT_ANSWERING:
    case CallStatus.SWITCHED_OFF:
    case CallStatus.BUSY:
      return "border-l-4 border-l-gray-300";
    default:
      return "border-l-4 border-l-gray-300";
  }
};

/**
 * Format call status for display
 */
const formatCallStatus = (status: CallStatus): string => {
  const statusMap: Record<CallStatus, string> = {
    [CallStatus.ANSWERED_AGREED]: "Agreed",
    [CallStatus.ANSWERED_DECLINED]: "Declined",
    [CallStatus.NOT_ANSWERING]: "Not Answering",
    [CallStatus.WRONG_NUMBER]: "Wrong Number",
    [CallStatus.SWITCHED_OFF]: "Switched Off",
    [CallStatus.BUSY]: "Busy",
    [CallStatus.CALLBACK_REQUESTED]: "Callback Requested",
  };
  return statusMap[status] || status;
};

/**
 * Get user display name
 */
const getUserDisplayName = (user: string | PopulatedUser): string => {
  if (typeof user === "string") return "Unknown";
  return `${user.firstName} ${user.lastName}`;
};

/**
 * Get icon for call status
 */
const getCallStatusIcon = (status: CallStatus) => {
  const iconClass = "h-4 w-4";
  switch (status) {
    case CallStatus.ANSWERED_AGREED:
      return <CheckCircle className={`${iconClass} text-green-600`} />;
    case CallStatus.ANSWERED_DECLINED:
    case CallStatus.WRONG_NUMBER:
      return <XCircle className={`${iconClass} text-red-600`} />;
    case CallStatus.NOT_ANSWERING:
    case CallStatus.SWITCHED_OFF:
      return <PhoneOff className={`${iconClass} text-gray-500`} />;
    case CallStatus.BUSY:
    case CallStatus.CALLBACK_REQUESTED:
      return <PhoneMissed className={`${iconClass} text-blue-500`} />;
    default:
      return <Phone className={`${iconClass} text-gray-500`} />;
  }
};

export function FollowupTimeline({ attempts }: FollowupTimelineProps) {
  if (attempts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Phone className="mx-auto h-12 w-12 opacity-50 mb-3" />
        <p>No follow-up attempts yet</p>
        <p className="text-sm mt-1">Add your first follow-up attempt below</p>
      </div>
    );
  }

  // Sort attempts by attempt number (descending) to show latest first
  const sortedAttempts = [...attempts].sort(
    (a, b) => b.attemptNumber - a.attemptNumber
  );

  return (
    <div className="space-y-3">
      {sortedAttempts.map((attempt) => (
        <Card
          key={attempt.attemptNumber}
          className="transition-all hover:shadow-md"
        >
          <CardContent className="py-4 px-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                  {getCallStatusIcon(attempt.callStatus)}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">
                    Attempt #{attempt.attemptNumber}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(attempt.attemptTimestamp), "MMM dd, yyyy 'at' hh:mm a")}
                  </p>
                </div>
              </div>
              <Badge variant={getCallStatusBadgeVariant(attempt.callStatus)} className="shrink-0">
                {formatCallStatus(attempt.callStatus)}
              </Badge>
            </div>

            <dl className="grid gap-2.5 text-sm mt-3 pl-12">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-3.5 w-3.5 shrink-0" />
                <span className="text-xs">
                  {attempt.attemptedBy
                    ? getUserDisplayName(attempt.attemptedBy)
                    : "Unknown User"}
                </span>
              </div>

              {attempt.notes && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span className="flex-1 text-xs leading-relaxed">{attempt.notes}</span>
                </div>
              )}

              {attempt.scheduledInterviewDate && (
                <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 dark:bg-green-950 rounded-md border border-green-200 dark:border-green-800">
                  <Calendar className="h-3.5 w-3.5 text-green-600 shrink-0" />
                  <span className="text-xs text-green-700 dark:text-green-300 font-medium">
                    Scheduled: {format(new Date(attempt.scheduledInterviewDate), "MMM dd, yyyy 'at' hh:mm a")}
                  </span>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
