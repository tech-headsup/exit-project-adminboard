import {
  UploadCandidatesRequest,
  UploadCandidatesResponse,
  GetCandidatesRequest,
  GetCandidatesResponse,
  GetCandidateByIdRequest,
  GetCandidateByIdResponse,
  DeleteCandidateRequest,
  DeleteCandidateResponse,
  AssignInterviewerRequest,
  AssignInterviewerResponse,
  AutoAssignInterviewersRequest,
  AutoAssignInterviewersResponse,
  UpdateFollowupRequest,
  UpdateFollowupResponse,
  UpdateInterviewDetailsRequest,
  UpdateInterviewDetailsResponse,
  UpdateCandidateStatusRequest,
  UpdateCandidateStatusResponse,
} from "@/types/candidateTypes";
import apiClient from "../client";
import { API_ENDPOINTS } from "@/constant/apiEnpoints";

export const candidateService = {
  // Upload candidates via Excel
  uploadCandidates: async (
    data: UploadCandidatesRequest
  ): Promise<UploadCandidatesResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.CANDIDATES.UPLOAD_EXCEL,
      data
    );
    return response.data;
  },

  // Get candidates with pagination/filtering/sorting
  getCandidates: async (
    params: GetCandidatesRequest
  ): Promise<GetCandidatesResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.CANDIDATES.GET,
      params
    );
    return response.data;
  },

  // Get a single candidate by ID
  getCandidateById: async (
    params: GetCandidateByIdRequest
  ): Promise<GetCandidateByIdResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.CANDIDATES.GET_BY_ID,
      params
    );
    return response.data;
  },

  // Delete a candidate
  deleteCandidate: async (
    params: DeleteCandidateRequest
  ): Promise<DeleteCandidateResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.CANDIDATES.DELETE,
      params
    );
    return response.data;
  },

  // Assign interviewer to candidates
  assignInterviewer: async (
    params: AssignInterviewerRequest
  ): Promise<AssignInterviewerResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.CANDIDATES.ASSIGN_INTERVIEWER,
      params
    );
    return response.data;
  },

  // Auto-assign interviewers to candidates
  autoAssignInterviewers: async (
    params: AutoAssignInterviewersRequest
  ): Promise<AutoAssignInterviewersResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.CANDIDATES.AUTO_ASSIGN_INTERVIEWERS,
      params
    );
    return response.data;
  },

  // Update followup attempt
  updateFollowup: async (
    params: UpdateFollowupRequest
  ): Promise<UpdateFollowupResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.CANDIDATES.UPDATE_FOLLOWUP,
      params
    );
    return response.data;
  },

  // Update interview details
  updateInterviewDetails: async (
    params: UpdateInterviewDetailsRequest
  ): Promise<UpdateInterviewDetailsResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.CANDIDATES.UPDATE_INTERVIEW_DETAILS,
      params
    );
    return response.data;
  },

  // Update overall status
  updateCandidateStatus: async (
    params: UpdateCandidateStatusRequest
  ): Promise<UpdateCandidateStatusResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.CANDIDATES.UPDATE_STATUS,
      params
    );
    return response.data;
  },
};
