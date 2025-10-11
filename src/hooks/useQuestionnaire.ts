import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { questionnaireService } from "@/api/services/questionnaireService";
import { queryKeys } from "@/utils/queryKeys";
import {
  CreateQuestionnaireRequest,
  SearchQuestionnairesRequest,
  UpdateQuestionnaireRequest,
  DuplicateQuestionnaireRequest,
  DeleteQuestionnaireRequest,
  // Legacy types for backward compatibility
  GetQuestionnairesRequest,
  GetGlobalTemplatesRequest,
} from "@/types/questionnaireTypes";

// ==================== QUERIES ====================

/**
 * Hook to search/fetch paginated/filtered questionnaires
 * @param params - Search filters, pagination, and sort options
 */
export const useQuestionnaires = (params: SearchQuestionnairesRequest = {}) => {
  return useQuery({
    queryKey: queryKeys.questionnaires.list(params),
    queryFn: () => questionnaireService.searchQuestionnaires(params),
  });
};

/**
 * Hook to fetch a single questionnaire by ID
 * @param questionnaireId - The questionnaire ID to fetch
 * @param enabled - Whether the query should run (default: true if questionnaireId exists)
 */
export const useQuestionnaireById = (
  questionnaireId: string,
  enabled = true
) => {
  return useQuery({
    queryKey: queryKeys.questionnaires.detail(questionnaireId),
    queryFn: () => questionnaireService.getQuestionnaire({ id: questionnaireId }),
    enabled: !!questionnaireId && enabled,
  });
};

/**
 * Hook to fetch global/default questionnaire templates
 * @param params - Search filters, pagination, and sort options
 */
export const useGlobalTemplates = (params: GetGlobalTemplatesRequest = {}) => {
  return useQuery({
    queryKey: queryKeys.questionnaires.globalTemplates(params),
    queryFn: () => questionnaireService.getGlobalTemplates(params),
  });
};

// ==================== MUTATIONS ====================

/**
 * Hook to create a new questionnaire
 */
export const useCreateQuestionnaire = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuestionnaireRequest) =>
      questionnaireService.createQuestionnaire(data),
    onSuccess: () => {
      // Invalidate all questionnaire queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: queryKeys.questionnaires.all });
    },
  });
};

/**
 * Hook to update a questionnaire
 * WARNING: Updating themes replaces ALL themes (not partial update)
 */
export const useUpdateQuestionnaire = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateQuestionnaireRequest) =>
      questionnaireService.updateQuestionnaire(data),
    onSuccess: (response) => {
      // Invalidate specific questionnaire query
      queryClient.invalidateQueries({
        queryKey: queryKeys.questionnaires.detail(response.data._id),
      });
      // Invalidate all questionnaire list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.questionnaires.all });
    },
  });
};

/**
 * Hook to delete a questionnaire (soft delete by default)
 * Pass hardDelete: true in params for permanent deletion
 */
export const useDeleteQuestionnaire = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DeleteQuestionnaireRequest | string) => {
      // Support both string (legacy) and object params
      const requestParams = typeof params === 'string'
        ? { id: params }
        : params;
      return questionnaireService.deleteQuestionnaire(requestParams);
    },
    onSuccess: (_, params) => {
      const questionnaireId = typeof params === 'string' ? params : params.id;
      // Remove from cache
      queryClient.removeQueries({
        queryKey: queryKeys.questionnaires.detail(questionnaireId),
      });
      // Invalidate all questionnaire queries
      queryClient.invalidateQueries({ queryKey: queryKeys.questionnaires.all });
    },
  });
};

/**
 * Hook to duplicate a questionnaire
 */
export const useDuplicateQuestionnaire = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: DuplicateQuestionnaireRequest) =>
      questionnaireService.duplicateQuestionnaire(params),
    onSuccess: () => {
      // Invalidate all questionnaire queries
      queryClient.invalidateQueries({ queryKey: queryKeys.questionnaires.all });
    },
  });
};

// ==================== LEGACY HOOKS (Deprecated - will be removed in future) ====================
// These hooks are kept for backward compatibility with existing code
// TODO: Update components to use the new hooks above

/**
 * @deprecated Use useQuestionnaires instead
 */
export const useGetQuestionnaires = (params: GetQuestionnairesRequest = {}) => {
  return useQuestionnaires(params);
};

/**
 * @deprecated Use useQuestionnaireById instead
 */
export const useGetQuestionnaireById = (
  questionnaireId: string,
  enabled = true
) => {
  return useQuestionnaireById(questionnaireId, enabled);
};

/**
 * @deprecated Use useGlobalTemplates instead
 */
export const useGetGlobalTemplates = (params: GetGlobalTemplatesRequest = {}) => {
  return useGlobalTemplates(params);
};

// Note: The following hooks are removed as the APIs no longer exist:
// - useAddQuestion
// - useUpdateQuestion
// - useDeleteQuestion
// Questions can no longer be added/updated/deleted individually.
// To modify questions, duplicate the questionnaire and create a new one.
