import { format } from "date-fns";
import { Phone, Clock, User, FileText, Calendar } from "lucide-react";
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
    <div className="space-y-4">
      {sortedAttempts.map((attempt) => (
        <Card key={attempt.attemptNumber}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <h4 className="font-semibold">
                  Follow-up Attempt #{attempt.attemptNumber}
                </h4>
              </div>
              <Badge variant={getCallStatusBadgeVariant(attempt.callStatus)}>
                {formatCallStatus(attempt.callStatus)}
              </Badge>
            </div>

            <dl className="grid gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {format(
                    new Date(attempt.attemptTimestamp),
                    "MMM dd, yyyy 'at' hh:mm a"
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>
                  Attempted by{" "}
                  {attempt.attemptedBy
                    ? getUserDisplayName(attempt.attemptedBy)
                    : "Unknown User"}
                </span>
              </div>

              {attempt.notes && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4 mt-0.5" />
                  <span className="flex-1">{attempt.notes}</span>
                </div>
              )}

              {attempt.scheduledInterviewDate && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Scheduled for{" "}
                    {format(
                      new Date(attempt.scheduledInterviewDate),
                      "MMM dd, yyyy 'at' hh:mm a"
                    )}
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
