"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { FollowupTimeline } from "./FollowupTimeline";
import { AddFollowupForm } from "./AddFollowupForm";
import { OverallStatusCard } from "./OverallStatusCard";
import { Candidate } from "@/types/candidateTypes";

interface FollowupsInterviewTabProps {
  candidate: Candidate;
}

export function FollowupsInterviewTab({
  candidate,
}: FollowupsInterviewTabProps) {
  const { user } = useAuthContext();
  const userId = user?._id || "";

  // Calculate next attempt number
  const nextAttemptNumber = (candidate.followupAttempts?.length || 0) + 1;

  return (
    <div className="space-y-6">
      {/* Main Content Grid */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Left Column: Follow-up Timeline + Add Form */}
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-1 w-1 rounded-full bg-primary" />
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Follow-up History
              </h3>
            </div>
            <FollowupTimeline attempts={candidate.followupAttempts || []} />
          </div>

          <div>
            <AddFollowupForm
              candidateId={candidate._id}
              attemptNumber={nextAttemptNumber}
              maxAttempts={candidate.maxFollowupAttempts || 4}
              attemptedBy={userId}
              candidateStatus={candidate.overallStatus}
            />
          </div>
        </div>

        {/* Right Column: Overall Status */}
        <div className="space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-1 w-1 rounded-full bg-amber-500" />
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Admin Controls
              </h3>
            </div>
            <OverallStatusCard candidate={candidate} />
          </div>
        </div>
      </div>
    </div>
  );
}
