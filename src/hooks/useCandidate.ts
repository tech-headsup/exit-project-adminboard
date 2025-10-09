import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { candidateService } from "@/api/services/candidateService";
import { queryKeys } from "@/utils/queryKeys";
import {
  UploadCandidatesRequest,
  GetCandidatesRequest,
  DeleteCandidateRequest,
  AssignInterviewerRequest,
  AutoAssignInterviewersRequest,
  UpdateFollowupRequest,
  UpdateInterviewDetailsRequest,
  UpdateCandidateStatusRequest,
} from "@/types/candidateTypes";

// ==================== QUERIES ====================

/**
 * Hook to fetch paginated/filtered candidates
 * @param params - Search filters, pagination, and sort options
 */
export const useCandidates = (params: GetCandidatesRequest = {}) => {
  return useQuery({
    queryKey: queryKeys.candidates.list(params),
    queryFn: () => candidateService.getCandidates(params),
  });
};

/**
 * Hook to fetch a single candidate by ID
 * @param candidateId - The candidate ID to fetch
 * @param enabled - Whether the query should run (default: true if candidateId exists)
 */
export const useCandidateById = (candidateId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.candidates.detail(candidateId),
    queryFn: () => candidateService.getCandidateById({ id: candidateId }),
    enabled: !!candidateId && enabled,
  });
};

// ==================== MUTATIONS ====================

/**
 * Hook to upload candidates via Excel
 */
export const useUploadCandidates = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UploadCandidatesRequest) =>
      candidateService.uploadCandidates(data),
    onSuccess: () => {
      // Invalidate all candidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.all });
      // Also invalidate project readiness for the uploaded project
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
};

/**
 * Hook to delete a candidate
 */
export const useDeleteCandidate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeleteCandidateRequest) =>
      candidateService.deleteCandidate(params),
    onSuccess: (_, variables) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: queryKeys.candidates.detail(variables.id),
      });
      // Invalidate all candidate queries
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.all });
    },
  });
};

/**
 * Hook to assign interviewer to candidates
 */
export const useAssignInterviewer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignInterviewerRequest) =>
      candidateService.assignInterviewer(data),
    onSuccess: (response) => {
      // Invalidate all candidate queries
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.all });
      // Invalidate project readiness
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.readiness(response.data.projectId),
      });
    },
  });
};

/**
 * Hook to auto-assign interviewers to candidates
 */
export const useAutoAssignInterviewers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AutoAssignInterviewersRequest) =>
      candidateService.autoAssignInterviewers(data),
    onSuccess: () => {
      // Invalidate all candidate queries
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.all });
      // Invalidate all project queries
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
};

/**
 * Hook to update followup attempt
 */
export const useUpdateFollowup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateFollowupRequest) =>
      candidateService.updateFollowup(data),
    onSuccess: (response) => {
      // Invalidate specific candidate query
      queryClient.invalidateQueries({
        queryKey: queryKeys.candidates.detail(response.data._id),
      });
      // Invalidate all candidate list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.all });
    },
  });
};

/**
 * Hook to update interview details
 */
export const useUpdateInterviewDetails = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateInterviewDetailsRequest) =>
      candidateService.updateInterviewDetails(data),
    onSuccess: (response) => {
      // Invalidate specific candidate query
      queryClient.invalidateQueries({
        queryKey: queryKeys.candidates.detail(response.data._id),
      });
      // Invalidate all candidate list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.all });
    },
  });
};

/**
 * Hook to update overall candidate status
 */
export const useUpdateCandidateStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCandidateStatusRequest) =>
      candidateService.updateCandidateStatus(data),
    onSuccess: (response) => {
      // Invalidate specific candidate query
      queryClient.invalidateQueries({
        queryKey: queryKeys.candidates.detail(response.data._id),
      });
      // Invalidate all candidate list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.all });
    },
  });
};
