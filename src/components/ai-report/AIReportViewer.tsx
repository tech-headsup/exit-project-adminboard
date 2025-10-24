"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAIReport } from "@/hooks/useAIReport";
import { useGeneratePDF } from "@/hooks/useAIReport";
import { useUpdateReport } from "@/hooks/useAIReport";
import { useRegenerateReport } from "@/hooks/useAIReport";
import { useReportStore } from "@/stores/reportStore";
import { ReportStatus } from "@/types/aiReportTypes";
import { Download, Edit, Save, X, FileText, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Import all card components
import { ReportStatusIndicator } from "./ReportStatusIndicator";
import { ExecutiveSummaryCard } from "./ExecutiveSummaryCard";
import { KeyFindingsCard } from "./KeyFindingsCard";
import { ThemeInsightCard } from "./ThemeInsightCard";
import { SpecialInsightsCard } from "./SpecialInsightsCard";
import { RiskAssessmentCard } from "./RiskAssessmentCard";
import { RecommendationsCard } from "./RecommendationsCard";
import { ReportEditor } from "./ReportEditor";

interface AIReportViewerProps {
  candidateId: string;
  userId: string; // Current user ID for editedBy field
}

export function AIReportViewer({ candidateId, userId }: AIReportViewerProps) {
  // Fetch report data and status
  const {
    status,
    reportId,
    generatedAt,
    processingTimeMs,
    statusError,
    report,
    isLoading,
    hasError,
    statusQueryError,
    reportQueryError,
  } = useAIReport(candidateId);

  // Zustand store for editing state
  const {
    isEditMode,
    startEditing,
    cancelEditing,
    getEditedReport,
  } = useReportStore();

  // Mutations
  const { mutate: generatePDF, isPending: isGeneratingPDF } = useGeneratePDF();
  const { mutate: updateReport, isPending: isUpdatingReport } = useUpdateReport();
  const { mutate: regenerateReport, isPending: isRegenerating } = useRegenerateReport();

  // Handle edit mode toggle
  const handleStartEdit = () => {
    if (report && reportId) {
      startEditing(reportId, candidateId, report.generatedReport);
      toast.success("Edit mode enabled");
    }
  };

  const handleCancelEdit = () => {
    cancelEditing();
    toast.info("Changes discarded");
  };

  const handleSaveEdit = () => {
    const editedReport = getEditedReport();
    if (!editedReport || !reportId) return;

    updateReport(
      {
        reportId,
        editedBy: userId,
        updatedReport: editedReport,
      },
      {
        onSuccess: () => {
          cancelEditing();
          toast.success("Report updated successfully");
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.error || "Failed to update report"
          );
        },
      }
    );
  };

  // Handle PDF download
  const handleDownloadPDF = () => {
    generatePDF(
      { candidateId },
      {
        onSuccess: () => {
          toast.success("PDF downloaded successfully");
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.error || "Failed to generate PDF"
          );
        },
      }
    );
  };

  // Handle report regeneration
  const handleRegenerateReport = () => {
    // Exit edit mode if active
    if (isEditMode) {
      cancelEditing();
    }

    regenerateReport(
      { candidateId },
      {
        onSuccess: () => {
          toast.success("Report regeneration started. Please wait...");
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.error || "Failed to regenerate report"
          );
        },
      }
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-sm text-muted-foreground">Loading report data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
        <h3 className="text-lg font-semibold text-destructive">
          Error Loading Report
        </h3>
        <p className="text-sm text-destructive/80 mt-2">
          {statusQueryError?.message ||
            reportQueryError?.message ||
            "Failed to load report data"}
        </p>
      </div>
    );
  }

  // Show status indicator
  if (!status) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground mt-4">
          No report data available for this candidate.
        </p>
      </div>
    );
  }

  // PENDING or FAILED state - show status indicator
  if (status !== ReportStatus.COMPLETED) {
    return (
      <ReportStatusIndicator
        status={status}
        processingTimeMs={processingTimeMs}
        error={statusError}
        generatedAt={generatedAt}
      />
    );
  }

  // COMPLETED state - show full report
  if (!report) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground mt-4">
          Report status is completed but data is not available.
        </p>
      </div>
    );
  }

  const { generatedReport, isEdited, editedBy, editedAt } = report;

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">AI-Generated Report</h2>
          {isEdited && (
            <Badge variant="secondary" className="text-xs">
              Edited
            </Badge>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {!isEditMode ? (
            <>
              {/* Regenerate Report Button with Confirmation Dialog */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={isGeneratingPDF || isRegenerating}
                  >
                    {isRegenerating ? (
                      <>
                        <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-foreground border-t-transparent" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate Report
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Regenerate AI Report?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will delete the current report and generate a new one from scratch.
                      Any manual edits will be lost. This action cannot be undone.
                      <br /><br />
                      <strong>Note:</strong> The new report will be generated based on the latest interview answers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRegenerateReport}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Yes, Regenerate
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button
                variant="outline"
                onClick={handleStartEdit}
                disabled={isGeneratingPDF || isRegenerating}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Report
              </Button>
              <Button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF || isRegenerating}
              >
                {isGeneratingPDF ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                disabled={isUpdatingReport}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={isUpdatingReport}
              >
                {isUpdatingReport ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status indicator (completed state) */}
      <ReportStatusIndicator
        status={status}
        processingTimeMs={processingTimeMs}
        error={statusError}
        generatedAt={generatedAt}
      />

      {/* Edit mode */}
      {isEditMode ? (
        <ReportEditor />
      ) : (
        /* Read-only view */
        <div className="space-y-6">
          {/* Executive Summary */}
          <ExecutiveSummaryCard
            summary={generatedReport.executiveSummary}
            sentiment={generatedReport.overallSentiment}
          />

          {/* Key Findings */}
          <KeyFindingsCard findings={generatedReport.keyFindings} />

          {/* Theme Insights */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Theme Insights</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {generatedReport.themeInsights.map((theme) => (
                <ThemeInsightCard key={theme.themeId} theme={theme} />
              ))}
            </div>
          </div>

          {/* Special Insights */}
          <SpecialInsightsCard insights={generatedReport.specialInsights} />

          {/* Risk Assessment */}
          <RiskAssessmentCard riskLevel={generatedReport.riskLevel} />

          {/* Recommendations */}
          <RecommendationsCard
            recommendations={generatedReport.recommendations}
          />
        </div>
      )}

      {/* Edit metadata */}
      {isEdited && editedAt && !isEditMode && (
        <div className="text-xs text-muted-foreground text-center py-4 border-t">
          Last edited on {new Date(editedAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}
