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
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30 pb-3">
          <CardTitle className="text-base font-semibold">
            Manual Status Override
          </CardTitle>
          <CardDescription className="text-xs">
            {isCurrentlyDropped
              ? "Candidate was dropped. You can restore by selecting a different status."
              : "Status is automatically managed. Use this only for manual corrections."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {isCurrentlyDropped && (
            <Alert variant="destructive" className="py-2">
              <AlertTriangle className="h-3.5 w-3.5" />
              <AlertDescription className="text-xs">
                Candidate was dropped. Select a different status to restore.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <span className="text-xs font-medium text-muted-foreground">
              Current Status
            </span>
            <Badge
              variant={getOverallStatusBadgeVariant(currentStatus)}
              className="text-xs px-2.5 py-0.5 font-medium"
            >
              {formatOverallStatus(currentStatus)}
            </Badge>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Select New Status
            </label>
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
                {/* <SelectItem value={OverallStatus.REPORT_GENERATED}>
                  {formatOverallStatus(OverallStatus.REPORT_GENERATED)}
                </SelectItem> */}
              </SelectContent>
            </Select>
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
