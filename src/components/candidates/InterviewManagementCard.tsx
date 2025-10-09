"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  Play,
  CheckCircle2,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useUpdateInterviewDetails,
  useUpdateCandidateStatus,
} from "@/hooks/useCandidate";
import { Candidate, OverallStatus } from "@/types/candidateTypes";

interface InterviewManagementCardProps {
  candidate: Candidate;
}

export function InterviewManagementCard({
  candidate,
}: InterviewManagementCardProps) {
  console.log("candidate---", candidate);

  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);

  const updateInterviewMutation = useUpdateInterviewDetails();
  const updateStatusMutation = useUpdateCandidateStatus();

  const interviewDetails = candidate.interviewDetails;
  const scheduledDate = interviewDetails?.scheduledDate;
  const startedAt = interviewDetails?.startedAt;
  const completedAt = interviewDetails?.completedAt;
  const duration = interviewDetails?.interviewDurationMinutes;
  const overallStatus = candidate.overallStatus;

  // Derive status from dates
  const getInterviewStatus = () => {
    if (completedAt) return "COMPLETED";
    if (startedAt) return "IN_PROGRESS";
    if (scheduledDate) return "SCHEDULED";
    return "NOT_STARTED";
  };

  const status = getInterviewStatus();

  console.log("status---", status);

  const isDropped = overallStatus === OverallStatus.DROPPED;

  const handleStartInterview = async () => {
    try {
      // Step 1: Update status to IN_PROGRESS
      await updateStatusMutation.mutateAsync({
        candidateId: candidate._id,
        overallStatus: OverallStatus.IN_PROGRESS,
      });

      // Step 2: Log start time
      await updateInterviewMutation.mutateAsync({
        candidateId: candidate._id,
        startedAt: new Date().toISOString(),
      });

      toast.success(
        "Interview started! Go to Q&A Form tab to conduct the interview."
      );
      setIsStartDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to start interview");
    }
  };

  const handleCompleteInterview = async () => {
    try {
      const completedTime = new Date();
      const startTime = startedAt ? new Date(startedAt) : completedTime;
      const durationMinutes = Math.floor(
        (completedTime.getTime() - startTime.getTime()) / 60000
      );

      // Step 1: Update interview details
      await updateInterviewMutation.mutateAsync({
        candidateId: candidate._id,
        completedAt: completedTime.toISOString(),
        interviewDurationMinutes: durationMinutes,
        answersSubmitted: true, // Assume true if completing via this button
      });

      // Step 2: Update status to INTERVIEWED
      await updateStatusMutation.mutateAsync({
        candidateId: candidate._id,
        overallStatus: OverallStatus.INTERVIEWED,
      });

      toast.success("Interview completed successfully!");
      setIsCompleteDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to complete interview");
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Interview Management</CardTitle>
            <Badge
              variant={
                status === "COMPLETED"
                  ? "secondary"
                  : status === "IN_PROGRESS"
                  ? "default"
                  : status === "SCHEDULED"
                  ? "default"
                  : "outline"
              }
            >
              {status.replace("_", " ")}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Info Alert */}
          {!scheduledDate && !isDropped && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Schedule interview by adding a follow-up with "Answered -
                Agreed" status. The interview date will auto-sync here.
              </AlertDescription>
            </Alert>
          )}

          {isDropped && (
            <Alert variant="destructive">
              <AlertDescription className="text-sm">
                This candidate has been dropped. No further actions available.
              </AlertDescription>
            </Alert>
          )}

          {/* Scheduled Date */}
          <div className="flex items-start gap-2 text-sm">
            <CalendarIcon className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div className="flex-1">
              <p className="font-medium text-muted-foreground">
                Scheduled Date
              </p>
              <p>
                {scheduledDate
                  ? format(new Date(scheduledDate), "MMM dd, yyyy 'at' hh:mm a")
                  : "Not scheduled yet"}
              </p>
            </div>
          </div>

          {/* Started At */}
          {startedAt && (
            <div className="flex items-start gap-2 text-sm">
              <Play className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div className="flex-1">
                <p className="font-medium text-muted-foreground">Started At</p>
                <p>
                  {format(new Date(startedAt), "MMM dd, yyyy 'at' hh:mm a")}
                </p>
              </div>
            </div>
          )}

          {/* Completed At */}
          {completedAt && (
            <>
              <div className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium text-muted-foreground">
                    Completed At
                  </p>
                  <p>
                    {format(new Date(completedAt), "MMM dd, yyyy 'at' hh:mm a")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium text-muted-foreground">Duration</p>
                  <p>{duration || 0} minutes</p>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          {!isDropped && (
            <div className="pt-4 space-y-2">
              {status === "SCHEDULED" && (
                <Button
                  onClick={() => setIsStartDialogOpen(true)}
                  className="w-full"
                  disabled={
                    updateInterviewMutation.isPending ||
                    updateStatusMutation.isPending
                  }
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Interview
                </Button>
              )}

              {status === "IN_PROGRESS" && (
                <Button
                  onClick={() => setIsCompleteDialogOpen(true)}
                  className="w-full"
                  disabled={
                    updateInterviewMutation.isPending ||
                    updateStatusMutation.isPending
                  }
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Complete Interview
                </Button>
              )}

              {status === "COMPLETED" && (
                <div className="text-center text-sm text-muted-foreground py-2">
                  ✓ Interview completed successfully
                </div>
              )}

              {status === "NOT_STARTED" && !scheduledDate && (
                <div className="text-center text-sm text-muted-foreground py-2">
                  Add a follow-up with "Answered - Agreed" to schedule the
                  interview
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Start Interview Confirmation Dialog */}
      <Dialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Interview</DialogTitle>
            <DialogDescription>
              Are you ready to start the interview with this candidate?
              <br />
              <br />
              This will:
              <ul className="list-disc list-inside mt-2">
                <li>Update status to IN_PROGRESS</li>
                <li>Log the start time</li>
                <li>Enable the Q&A Form tab</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStartDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartInterview}
              disabled={
                updateInterviewMutation.isPending ||
                updateStatusMutation.isPending
              }
            >
              Start Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Interview Confirmation Dialog */}
      <Dialog
        open={isCompleteDialogOpen}
        onOpenChange={setIsCompleteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Interview</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this interview as completed?
              {!interviewDetails?.answersSubmitted && (
                <span className="block mt-2 text-amber-600">
                  Warning: Make sure all Q&A responses are submitted before
                  completing.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCompleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompleteInterview}
              disabled={
                updateInterviewMutation.isPending ||
                updateStatusMutation.isPending
              }
            >
              Complete Interview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
