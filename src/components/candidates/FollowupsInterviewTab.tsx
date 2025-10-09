"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { FollowupTimeline } from "./FollowupTimeline";
import { AddFollowupForm } from "./AddFollowupForm";
import { InterviewManagementCard } from "./InterviewManagementCard";
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
    <div className="grid gap-6 md:grid-cols-2">
      {/* Left Column: Follow-up Timeline + Add Form */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Follow-up History</h3>
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

      {/* Right Column: Interview Management & Overall Status */}
      <div className="space-y-6">
        <InterviewManagementCard candidate={candidate} />
        <OverallStatusCard candidate={candidate} />
      </div>
    </div>
  );
}
