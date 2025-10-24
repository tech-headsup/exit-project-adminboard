import {
  CheckReportStatusRequest,
  CheckReportStatusResponse,
  GetReportByCandidateRequest,
  GetReportByCandidateResponse,
  UpdateReportRequest,
  UpdateReportResponse,
  GeneratePDFRequest,
  GeneratePDFResponse,
  RegenerateReportRequest,
  RegenerateReportResponse,
} from "@/types/aiReportTypes";
import apiClient from "../client";
import { API_ENDPOINTS } from "@/constant/apiEnpoints";

export const aiReportService = {
  // Check report status (for polling)
  checkReportStatus: async (
    params: CheckReportStatusRequest
  ): Promise<CheckReportStatusResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.AI_REPORT.CHECK_STATUS,
      params
    );
    return response.data;
  },

  // Get report by candidate
  getReportByCandidate: async (
    params: GetReportByCandidateRequest
  ): Promise<GetReportByCandidateResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.AI_REPORT.GET_BY_CANDIDATE,
      params
    );
    return response.data;
  },

  // Update/edit report
  updateReport: async (
    params: UpdateReportRequest
  ): Promise<UpdateReportResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.AI_REPORT.UPDATE,
      params
    );
    return response.data;
  },

  // Generate and download PDF
  generatePDF: async (params: GeneratePDFRequest): Promise<GeneratePDFResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.AI_REPORT.GENERATE_PDF,
      params,
      {
        responseType: "blob", // Important: Tell axios to expect a blob response
      }
    );
    return response.data;
  },

  // Regenerate report (delete old and create new)
  regenerateReport: async (
    params: RegenerateReportRequest
  ): Promise<RegenerateReportResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.AI_REPORT.REGENERATE,
      params
    );
    return response.data;
  },
};
