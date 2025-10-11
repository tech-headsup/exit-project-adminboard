import {
  SubmitInterviewAnswersRequest,
  SubmitInterviewAnswersResponse,
  SubmitBulkAnswersRequest,
  SubmitBulkAnswersResponse,
  GetAnswersByCandidateRequest,
  GetAnswersByCandidateResponse,
  GetAnswersByProjectRequest,
  GetAnswersByProjectResponse,
  GetAnswerByIdRequest,
  GetAnswerByIdResponse,
  UpdateAnswerRequest,
  UpdateAnswerResponse,
  DeleteAnswerRequest,
  DeleteAnswerResponse,
} from "@/types/answerTypes";
import apiClient from "../client";
import { API_ENDPOINTS } from "@/constant/apiEnpoints";

export const answerService = {
  // Submit all interview answers in one request (complete interview) - PRIMARY ENDPOINT
  submitInterviewAnswers: async (
    data: SubmitInterviewAnswersRequest
  ): Promise<SubmitInterviewAnswersResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.ANSWERS.SUBMIT_INTERVIEW,
      data
    );
    return response.data;
  },

  // Submit multiple answers (legacy endpoint - use submitInterviewAnswers instead)
  submitBulkAnswers: async (
    data: SubmitBulkAnswersRequest
  ): Promise<SubmitBulkAnswersResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.ANSWERS.SUBMIT_BULK,
      data
    );
    return response.data;
  },

  // Get all answers for a candidate, grouped by theme
  getAnswersByCandidate: async (
    params: GetAnswersByCandidateRequest
  ): Promise<GetAnswersByCandidateResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.ANSWERS.GET_BY_CANDIDATE,
      params
    );
    return response.data;
  },

  // Get all answers for a project (analytics)
  getAnswersByProject: async (
    params: GetAnswersByProjectRequest
  ): Promise<GetAnswersByProjectResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.ANSWERS.GET_BY_PROJECT,
      params
    );
    return response.data;
  },

  // Get a single answer by ID
  getAnswerById: async (
    params: GetAnswerByIdRequest
  ): Promise<GetAnswerByIdResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.ANSWERS.SEARCH_BY_ID,
      params
    );
    return response.data;
  },

  // Update an existing answer
  updateAnswer: async (
    params: UpdateAnswerRequest
  ): Promise<UpdateAnswerResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.ANSWERS.UPDATE,
      params
    );
    return response.data;
  },

  // Delete an answer (soft delete by default, hard delete if hardDelete: true)
  deleteAnswer: async (
    params: DeleteAnswerRequest
  ): Promise<DeleteAnswerResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.ANSWERS.DELETE,
      params
    );
    return response.data;
  },
};
