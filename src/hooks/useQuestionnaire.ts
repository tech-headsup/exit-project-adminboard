import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { questionnaireService } from "@/api/services/questionnaireService";
import { queryKeys } from "@/utils/queryKeys";
import {
  CreateQuestionnaireRequest,
  GetQuestionnairesRequest,
  GetGlobalTemplatesRequest,
  DuplicateQuestionnaireRequest,
  AddQuestionRequest,
  UpdateQuestionRequest,
  DeleteQuestionRequest,
} from "@/types/questionnaireTypes";

// ==================== QUERIES ====================

/**
 * Hook to fetch paginated/filtered questionnaires
 * @param params - Search filters, pagination, and sort options
 */
export const useQuestionnaires = (params: GetQuestionnairesRequest = {}) => {
  return useQuery({
    queryKey: queryKeys.questionnaires.list(params),
    queryFn: () => questionnaireService.getQuestionnaires(params),
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
 * Hook to fetch global questionnaire templates
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
 * Hook to delete a questionnaire
 */
export const useDeleteQuestionnaire = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      questionnaireService.deleteQuestionnaire({ id }),
    onSuccess: (_, questionnaireId) => {
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

/**
 * Hook to add a question to a questionnaire
 */
export const useAddQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddQuestionRequest) =>
      questionnaireService.addQuestion(data),
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
 * Hook to update a question in a questionnaire
 */
export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateQuestionRequest) =>
      questionnaireService.updateQuestion(data),
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
 * Hook to delete a question from a questionnaire
 */
export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeleteQuestionRequest) =>
      questionnaireService.deleteQuestion(data),
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
