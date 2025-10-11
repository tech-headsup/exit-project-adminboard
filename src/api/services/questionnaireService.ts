import {
  CreateQuestionnaireRequest,
  CreateQuestionnaireResponse,
  GetQuestionnaireRequest,
  GetQuestionnaireResponse,
  SearchQuestionnairesRequest,
  SearchQuestionnairesResponse,
  DeleteQuestionnaireRequest,
  DeleteQuestionnaireResponse,
  DuplicateQuestionnaireRequest,
  DuplicateQuestionnaireResponse,
  // Legacy types for backward compatibility
  GetQuestionnairesRequest,
  GetQuestionnairesResponse,
  GetGlobalTemplatesRequest,
  GetGlobalTemplatesResponse,
} from "@/types/questionnaireTypes";
import apiClient from "../client";
import { API_ENDPOINTS } from "@/constant/apiEnpoints";

export const questionnaireService = {
  // Create a new questionnaire
  createQuestionnaire: async (
    data: CreateQuestionnaireRequest
  ): Promise<CreateQuestionnaireResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.QUESTIONNAIRES.CREATE,
      data
    );
    return response.data;
  },

  // Get a single questionnaire by ID
  getQuestionnaire: async (
    params: GetQuestionnaireRequest
  ): Promise<GetQuestionnaireResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.QUESTIONNAIRES.SEARCH_BY_ID,
      params
    );
    return response.data;
  },

  // Search questionnaires with pagination/filtering/sorting
  searchQuestionnaires: async (
    params: SearchQuestionnairesRequest
  ): Promise<SearchQuestionnairesResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.QUESTIONNAIRES.SEARCH,
      params
    );
    return response.data;
  },

  // Delete a questionnaire
  deleteQuestionnaire: async (
    params: DeleteQuestionnaireRequest
  ): Promise<DeleteQuestionnaireResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.QUESTIONNAIRES.DELETE,
      params
    );
    return response.data;
  },

  // Duplicate a questionnaire
  duplicateQuestionnaire: async (
    params: DuplicateQuestionnaireRequest
  ): Promise<DuplicateQuestionnaireResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.QUESTIONNAIRES.DUPLICATE,
      params
    );
    return response.data;
  },

  // ==================== LEGACY METHODS (For Backward Compatibility) ====================
  // These methods use the old naming but call the new endpoints

  // Get all questionnaires (legacy method - calls searchQuestionnaires)
  getQuestionnaires: async (
    params: GetQuestionnairesRequest
  ): Promise<GetQuestionnairesResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.QUESTIONNAIRES.SEARCH,
      params
    );
    return response.data;
  },

  // Get global templates (legacy method - calls searchQuestionnaires with isDefault filter)
  getGlobalTemplates: async (
    params: GetGlobalTemplatesRequest
  ): Promise<GetGlobalTemplatesResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.QUESTIONNAIRES.SEARCH,
      {
        ...params,
        search: {
          ...params.search,
          isDefault: true,
        },
      }
    );
    return response.data;
  },
};
