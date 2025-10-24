import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { aiReportService } from "@/api/services/aiReportService";
import { queryKeys } from "@/utils/queryKeys";
import {
  CheckReportStatusRequest,
  GetReportByCandidateRequest,
  UpdateReportRequest,
  GeneratePDFRequest,
  RegenerateReportRequest,
  ReportStatus,
} from "@/types/aiReportTypes";

// ==================== QUERIES ====================

/**
 * Hook to check AI report generation status (used for polling)
 * @param candidateId - The candidate ID to check report status for
 * @param enabled - Whether the query should run
 * @param refetchInterval - Custom refetch interval (default: 5 seconds for PENDING status)
 */
export const useReportStatus = (
  candidateId: string,
  enabled = true,
  refetchInterval?: number
) => {
  return useQuery({
    queryKey: queryKeys.aiReports.status(candidateId),
    queryFn: () => aiReportService.checkReportStatus({ candidateId }),
    enabled: !!candidateId && enabled,
    refetchInterval: (query) => {
      // If custom refetchInterval is provided, use it
      if (refetchInterval !== undefined) {
        return refetchInterval;
      }
      // Auto-poll every 5 seconds if status is PENDING
      if (query.state.data?.data?.status === ReportStatus.PENDING) {
        return 5000;
      }
      // Stop polling if status is COMPLETED or FAILED
      return false;
    },
    // Don't throw errors, handle them in the component
    retry: 1,
  });
};

/**
 * Hook to fetch AI report by candidate
 * @param candidateId - The candidate ID to fetch report for
 * @param enabled - Whether the query should run (default: true if candidateId exists)
 */
export const useReportByCandidate = (candidateId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.aiReports.byCandidate(candidateId),
    queryFn: () => aiReportService.getReportByCandidate({ candidateId }),
    enabled: !!candidateId && enabled,
    // Report data is relatively static once generated
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ==================== MUTATIONS ====================

/**
 * Hook to update/edit AI report
 */
export const useUpdateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateReportRequest) =>
      aiReportService.updateReport(params),
    onSuccess: (response, variables) => {
      // Invalidate report queries to refetch updated data
      queryClient.invalidateQueries({
        queryKey: queryKeys.aiReports.byCandidate(response.data.candidateId),
      });
      // Also invalidate the candidate detail to update reportId and other related data
      queryClient.invalidateQueries({
        queryKey: queryKeys.candidates.detail(response.data.candidateId),
      });
    },
  });
};

/**
 * Hook to generate and download PDF
 * This hook handles the PDF blob and triggers download
 */
export const useGeneratePDF = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: GeneratePDFRequest) => {
      const blob = await aiReportService.generatePDF(params);
      return { blob, candidateId: params.candidateId };
    },
    onSuccess: ({ blob, candidateId }, variables) => {
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `exit-interview-report-${candidateId}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Invalidate report to update download count
      queryClient.invalidateQueries({
        queryKey: queryKeys.aiReports.byCandidate(candidateId),
      });
    },
  });
};

/**
 * Hook to regenerate AI report (delete old and create new)
 * This will invalidate both status and report queries to trigger refetch
 */
export const useRegenerateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: RegenerateReportRequest) =>
      aiReportService.regenerateReport(params),
    onSuccess: (response, variables) => {
      // Invalidate status query to start polling for new report
      queryClient.invalidateQueries({
        queryKey: queryKeys.aiReports.status(variables.candidateId),
      });
      // Invalidate report query
      queryClient.invalidateQueries({
        queryKey: queryKeys.aiReports.byCandidate(variables.candidateId),
      });
      // Also invalidate the candidate detail to update reportId
      queryClient.invalidateQueries({
        queryKey: queryKeys.candidates.detail(variables.candidateId),
      });
    },
  });
};

/**
 * Combined hook that manages both status checking and report fetching
 * Automatically fetches report when status is COMPLETED
 * @param candidateId - The candidate ID
 * @param autoFetchReport - Whether to automatically fetch report when status is COMPLETED (default: true)
 */
export const useAIReport = (
  candidateId: string,
  autoFetchReport = true
) => {
  // Check report status
  const statusQuery = useReportStatus(candidateId, !!candidateId);

  // Fetch report if status is COMPLETED
  const reportQuery = useReportByCandidate(
    candidateId,
    autoFetchReport && statusQuery.data?.data?.status === ReportStatus.COMPLETED
  );

  return {
    // Status data
    status: statusQuery.data?.data?.status,
    reportId: statusQuery.data?.data?.reportId,
    generatedAt: statusQuery.data?.data?.generatedAt,
    processingTimeMs: statusQuery.data?.data?.processingTimeMs,
    statusError: statusQuery.data?.data?.error,

    // Report data
    report: reportQuery.data?.data,

    // Loading states
    isCheckingStatus: statusQuery.isLoading,
    isFetchingReport: reportQuery.isLoading,
    isLoading: statusQuery.isLoading || reportQuery.isLoading,

    // Error states
    statusQueryError: statusQuery.error,
    reportQueryError: reportQuery.error,
    hasError: !!statusQuery.error || !!reportQuery.error,

    // Refetch functions
    refetchStatus: statusQuery.refetch,
    refetchReport: reportQuery.refetch,
  };
};
