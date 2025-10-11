import {
  SubmitInterviewAnswersRequest,
  SubmitInterviewAnswersResponse,
  GetAnswersByCandidateRequest,
  GetAnswersByCandidateResponse,
  GetAnswersByProjectRequest,
  GetAnswersByProjectResponse,
} from "@/types/answerTypes";
import apiClient from "../client";
import { API_ENDPOINTS } from "@/constant/apiEnpoints";

export const answerService = {
  // Submit all interview answers in one request (complete interview)
  submitInterviewAnswers: async (
    data: SubmitInterviewAnswersRequest
  ): Promise<SubmitInterviewAnswersResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.ANSWERS.SUBMIT_INTERVIEW,
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
};
