"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateCandidateStatus } from "@/hooks/useCandidate";
import { Candidate, OverallStatus } from "@/types/candidateTypes";

interface OverallStatusCardProps {
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
    case OverallStatus.IN_PROGRESS:
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
 * Format overall status for display
 */
const formatOverallStatus = (status: OverallStatus): string => {
  const statusMap: Record<OverallStatus, string> = {
    [OverallStatus.NEW]: "New",
    [OverallStatus.ASSIGNED]: "Assigned",
    [OverallStatus.ATTEMPTING]: "Attempting",
    [OverallStatus.SCHEDULED]: "Scheduled",
    [OverallStatus.IN_PROGRESS]: "In Progress",
    [OverallStatus.INTERVIEWED]: "Interviewed",
    [OverallStatus.REPORT_GENERATED]: "Report Generated",
    [OverallStatus.DROPPED]: "Dropped",
  };
  return statusMap[status] || status;
};

export function OverallStatusCard({ candidate }: OverallStatusCardProps) {
  const [selectedStatus, setSelectedStatus] = useState<OverallStatus | null>(
    null
  );
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const updateStatusMutation = useUpdateCandidateStatus();

  const currentStatus = candidate.overallStatus;
  const isCurrentlyDropped = currentStatus === OverallStatus.DROPPED;

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus as OverallStatus);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedStatus) return;

    try {
      await updateStatusMutation.mutateAsync({
        candidateId: candidate._id,
        overallStatus: selectedStatus,
      });

      toast.success(`Status updated to ${formatOverallStatus(selectedStatus)}`);
      setIsConfirmDialogOpen(false);
      setSelectedStatus(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  // Check if user is trying to DROP the candidate
  const isDroppingCandidate =
    selectedStatus === OverallStatus.DROPPED && !isCurrentlyDropped;

  // Check if user is trying to RESTORE a dropped candidate
  const isRestoringCandidate =
    isCurrentlyDropped && selectedStatus !== OverallStatus.DROPPED;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Overall Status</CardTitle>
          <CardDescription>
            {isCurrentlyDropped
              ? "This candidate was dropped. You can restore them by changing the status below."
              : "Status updates automatically based on follow-up calls and interview progress"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isCurrentlyDropped && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This candidate was dropped from the interview process. You can
                restore them by selecting a different status below.
              </AlertDescription>
            </Alert>
          )}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Current Status
            </p>
            <Badge
              variant={getOverallStatusBadgeVariant(currentStatus)}
              className="text-sm px-3 py-1"
            >
              {formatOverallStatus(currentStatus)}
            </Badge>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Change Status (Manual Override)
            </p>
            <Select onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                {/* <SelectItem value={OverallStatus.NEW}>
                  {formatOverallStatus(OverallStatus.NEW)}
                </SelectItem>
                <SelectItem value={OverallStatus.ASSIGNED}>
                  {formatOverallStatus(OverallStatus.ASSIGNED)}
                </SelectItem> */}
                <SelectItem value={OverallStatus.ATTEMPTING}>
                  {formatOverallStatus(OverallStatus.ATTEMPTING)}
                </SelectItem>
                <SelectItem value={OverallStatus.SCHEDULED}>
                  {formatOverallStatus(OverallStatus.SCHEDULED)}
                </SelectItem>
                <SelectItem value={OverallStatus.IN_PROGRESS}>
                  {formatOverallStatus(OverallStatus.IN_PROGRESS)}
                </SelectItem>
                <SelectItem value={OverallStatus.INTERVIEWED}>
                  {formatOverallStatus(OverallStatus.INTERVIEWED)}
                </SelectItem>
                <SelectItem value={OverallStatus.DROPPED}>
                  {formatOverallStatus(OverallStatus.DROPPED)}
                </SelectItem>
                <SelectItem value={OverallStatus.REPORT_GENERATED}>
                  {formatOverallStatus(OverallStatus.REPORT_GENERATED)}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium mb-2">Typical Status Flow:</p>
            <div className="text-muted-foreground space-y-1">
              <p>1. NEW → Initial state</p>
              <p>2. ASSIGNED → Interviewer assigned</p>
              <p>3. ATTEMPTING → Follow-up calls in progress</p>
              <p>4. SCHEDULED → Interview scheduled</p>
              <p>5. IN_PROGRESS → Interview in progress</p>
              <p>6. INTERVIEWED → Interview completed</p>
              <p>7. REPORT_GENERATED → AI report ready</p>
              <p className="text-destructive">
                DROPPED → Candidate dropped out
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isDroppingCandidate && "⚠️ Drop Candidate"}
              {isRestoringCandidate && "Restore Candidate"}
              {!isDroppingCandidate &&
                !isRestoringCandidate &&
                "Confirm Status Change"}
            </DialogTitle>
            <DialogDescription className="space-y-2">
              {isDroppingCandidate && (
                <>
                  <p className="text-destructive font-semibold">
                    Warning: You are about to drop this candidate from the
                    interview process.
                  </p>
                  <p>This will:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Remove them from active interviews</li>
                    <li>Disable follow-up calls</li>
                    <li>Prevent interview scheduling</li>
                    <li>
                      Mark them as permanently dropped (can be restored
                      manually)
                    </li>
                  </ul>
                  <p className="font-medium mt-3">
                    Are you sure you want to drop{" "}
                    <strong>{candidate.name}</strong>?
                  </p>
                </>
              )}

              {isRestoringCandidate && (
                <>
                  <p>
                    This candidate was previously dropped from the interview
                    process.
                  </p>
                  <p className="font-medium">
                    Are you sure you want to restore them to{" "}
                    <strong>
                      {selectedStatus && formatOverallStatus(selectedStatus)}
                    </strong>
                    ?
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    This will allow them to continue in the interview workflow.
                  </p>
                </>
              )}

              {!isDroppingCandidate && !isRestoringCandidate && (
                <p>
                  Are you sure you want to change the status from{" "}
                  <strong>{formatOverallStatus(currentStatus)}</strong> to{" "}
                  <strong>
                    {selectedStatus && formatOverallStatus(selectedStatus)}
                  </strong>
                  ?
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsConfirmDialogOpen(false);
                setSelectedStatus(null);
              }}
              disabled={updateStatusMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmStatusChange}
              disabled={updateStatusMutation.isPending}
              variant={isDroppingCandidate ? "destructive" : "default"}
            >
              {updateStatusMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isDroppingCandidate && "Yes, Drop Candidate"}
              {isRestoringCandidate && "Yes, Restore Candidate"}
              {!isDroppingCandidate &&
                !isRestoringCandidate &&
                "Confirm Change"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
