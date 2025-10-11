import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { answerService } from "@/api/services/answerService";
import { queryKeys } from "@/utils/queryKeys";
import {
  SubmitInterviewAnswersRequest,
  GetAnswersByCandidateRequest,
  GetAnswersByProjectRequest,
} from "@/types/answerTypes";

// ==================== QUERIES ====================

/**
 * Hook to fetch all answers for a candidate, grouped by theme
 * @param candidateId - The candidate ID to fetch answers for
 * @param themeId - Optional theme ID to filter by specific theme
 * @param enabled - Whether the query should run (default: true if candidateId exists)
 */
export const useAnswersByCandidate = (
  candidateId: string,
  themeId?: string,
  enabled = true
) => {
  const params: GetAnswersByCandidateRequest = {
    candidateId,
    ...(themeId && { themeId }),
  };

  return useQuery({
    queryKey: queryKeys.answers.byCandidate(params),
    queryFn: () => answerService.getAnswersByCandidate(params),
    enabled: !!candidateId && enabled,
  });
};

/**
 * Hook to fetch all answers for a project (analytics)
 * @param projectId - The project ID to fetch answers for
 * @param params - Optional pagination and filter params
 * @param enabled - Whether the query should run (default: true if projectId exists)
 */
export const useAnswersByProject = (
  projectId: string,
  params?: Omit<GetAnswersByProjectRequest, "projectId">,
  enabled = true
) => {
  const fullParams: GetAnswersByProjectRequest = {
    projectId,
    ...params,
  };

  return useQuery({
    queryKey: queryKeys.answers.byProject(fullParams),
    queryFn: () => answerService.getAnswersByProject(fullParams),
    enabled: !!projectId && enabled,
  });
};

// ==================== MUTATIONS ====================

/**
 * Hook to submit all interview answers in one request (complete interview)
 *
 * This is the main endpoint for submitting interview results.
 * It handles:
 * - Bulk inserting all answers to database
 * - Updating candidate.interviewDetails (completedAt, duration, answersSubmitted, completedThemes)
 * - Auto-updating candidate.overallStatus to "INTERVIEWED"
 * - Triggering AI report generation
 *
 * Important:
 * - All themes must be covered (at least answer OR notes for each theme)
 * - Frontend should validate before calling this
 */
export const useSubmitInterviewAnswers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SubmitInterviewAnswersRequest) =>
      answerService.submitInterviewAnswers(data),
    onSuccess: (response, variables) => {
      // Invalidate specific candidate query
      queryClient.invalidateQueries({
        queryKey: queryKeys.candidates.detail(variables.candidateId),
      });

      // Invalidate all candidate list queries (status changed to INTERVIEWED)
      queryClient.invalidateQueries({ queryKey: queryKeys.candidates.all });

      // Invalidate answers for this candidate
      queryClient.invalidateQueries({
        queryKey: queryKeys.answers.byCandidate({ candidateId: variables.candidateId }),
      });

      // Invalidate answers for this project
      queryClient.invalidateQueries({
        queryKey: queryKeys.answers.byProject({ projectId: variables.projectId }),
      });
    },
  });
};
