"use client";

import { useRouter } from "next/router";
import {
  ArrowLeft,
  UserCircle2,
  Phone,
  ClipboardList,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCandidateById } from "@/hooks/useCandidate";
import { ProfileDetailsTab } from "@/components/candidates/ProfileDetailsTab";
import { FollowupsInterviewTab } from "@/components/candidates/FollowupsInterviewTab";

export default function CandidateDetails() {
  const router = useRouter();
  const { id: projectId, candidateId } = router.query;

  // Fetch candidate data
  const { data, isLoading, error } = useCandidateById(
    candidateId as string,
    !!candidateId
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-8">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-8 w-64 animate-pulse rounded bg-muted" />
            <div className="h-4 w-48 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-6 px-8">
        <Button
          variant="ghost"
          onClick={() => router.push(`/projects/${projectId}/candidates`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Candidates
        </Button>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
          <h2 className="text-xl font-semibold text-destructive">
            Error Loading Candidate
          </h2>
          <p className="text-muted-foreground mt-2">
            {error instanceof Error
              ? error.message
              : "Failed to load candidate details"}
          </p>
        </div>
      </div>
    );
  }

  // No data state
  if (!data?.data) {
    return (
      <div className="container mx-auto py-6 px-8">
        <Button
          variant="ghost"
          onClick={() => router.push(`/projects/${projectId}/candidates`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Candidates
        </Button>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Candidate Not Found</h2>
          <p className="text-muted-foreground mt-2">
            The candidate you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  const candidate = data.data;

  // Calculate badge counts
  const followupCount = candidate.followupAttempts?.length || 0;
  const hasAnswersSubmitted =
    candidate.interviewDetails?.answersSubmitted || false;
  const hasReport = !!candidate.reportId;

  return (
    <div className="container mx-auto py-6 px-8">
      {/* Header with Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/projects/${projectId}/candidates`)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Candidates
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <UserCircle2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {candidate.name}
              </h1>
              <p className="text-muted-foreground mt-1">
                {candidate.designation} • {candidate.department}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile">
        <ScrollArea>
          <TabsList className="mb-3">
            <TabsTrigger value="profile">
              <UserCircle2
                className="-ms-0.5 me-1.5 opacity-60"
                size={16}
                aria-hidden="true"
              />
              Profile Details
            </TabsTrigger>
            <TabsTrigger value="followups" className="group">
              <Phone
                className="-ms-0.5 me-1.5 opacity-60"
                size={16}
                aria-hidden="true"
              />
              Follow-ups & Interview
              {followupCount > 0 && (
                <Badge
                  className="bg-primary/15 ms-1.5 min-w-5 px-1 transition-opacity group-data-[state=inactive]:opacity-50"
                  variant="secondary"
                >
                  {followupCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="qna" className="group">
              <ClipboardList
                className="-ms-0.5 me-1.5 opacity-60"
                size={16}
                aria-hidden="true"
              />
              Q&A Form
              {hasAnswersSubmitted && (
                <Badge className="ms-1.5 transition-opacity group-data-[state=inactive]:opacity-50">
                  Completed
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="report" className="group">
              <FileText
                className="-ms-0.5 me-1.5 opacity-60"
                size={16}
                aria-hidden="true"
              />
              Report
              {hasReport && (
                <Badge className="ms-1.5 transition-opacity group-data-[state=inactive]:opacity-50">
                  Generated
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Profile Details Tab */}
        <TabsContent value="profile">
          <ProfileDetailsTab candidate={candidate} />
        </TabsContent>

        {/* Follow-ups & Interview Tab */}
        <TabsContent value="followups">
          <FollowupsInterviewTab candidate={candidate} />
        </TabsContent>

        {/* Q&A Form Tab */}
        <TabsContent value="qna">
          <div className="rounded-lg border border-dashed p-12 text-center">
            <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground mt-4">
              Q&A Form will be implemented here.
            </p>
          </div>
        </TabsContent>

        {/* Report Tab */}
        <TabsContent value="report">
          <div className="rounded-lg border border-dashed p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground mt-4">
              AI-generated report will be displayed here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
