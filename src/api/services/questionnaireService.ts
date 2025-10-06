import {
  CreateQuestionnaireRequest,
  CreateQuestionnaireResponse,
  GetQuestionnaireRequest,
  GetQuestionnaireResponse,
  GetQuestionnairesRequest,
  GetQuestionnairesResponse,
  GetGlobalTemplatesRequest,
  GetGlobalTemplatesResponse,
  DeleteQuestionnaireRequest,
  DeleteQuestionnaireResponse,
  DuplicateQuestionnaireRequest,
  DuplicateQuestionnaireResponse,
  AddQuestionRequest,
  AddQuestionResponse,
  UpdateQuestionRequest,
  UpdateQuestionResponse,
  DeleteQuestionRequest,
  DeleteQuestionResponse,
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
      API_ENDPOINTS.QUESTIONNAIRES.GET,
      params
    );
    return response.data;
  },

  // Get all questionnaires with pagination/filtering/sorting
  getQuestionnaires: async (
    params: GetQuestionnairesRequest
  ): Promise<GetQuestionnairesResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.QUESTIONNAIRES.GET_ALL,
      params
    );
    return response.data;
  },

  // Get global templates
  getGlobalTemplates: async (
    params: GetGlobalTemplatesRequest
  ): Promise<GetGlobalTemplatesResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.QUESTIONNAIRES.GET_GLOBAL_TEMPLATES,
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

  // Add a question to a questionnaire
  addQuestion: async (
    params: AddQuestionRequest
  ): Promise<AddQuestionResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.QUESTIONNAIRES.ADD_QUESTION,
      params
    );
    return response.data;
  },

  // Update a question in a questionnaire
  updateQuestion: async (
    params: UpdateQuestionRequest
  ): Promise<UpdateQuestionResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.QUESTIONNAIRES.UPDATE_QUESTION,
      params
    );
    return response.data;
  },

  // Delete a question from a questionnaire
  deleteQuestion: async (
    params: DeleteQuestionRequest
  ): Promise<DeleteQuestionResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.QUESTIONNAIRES.DELETE_QUESTION,
      params
    );
    return response.data;
  },
};
