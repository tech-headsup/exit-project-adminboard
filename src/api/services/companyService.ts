import {
  CreateCompanyRequest,
  CreateCompanyResponse,
  UpdateCompanyRequest,
  UpdateCompanyResponse,
  GetCompaniesRequest,
  GetCompaniesResponse,
  GetCompanyByIdResponse,
  DeleteCompanyResponse,
} from "@/types/companyTypes";
import apiClient from "../client";
import { API_ENDPOINTS } from "@/constant/apiEnpoints";

export const companyService = {
  createCompany: async (
    companyData: CreateCompanyRequest
  ): Promise<CreateCompanyResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.COMPANYS.CREATE, companyData);
    return response.data;
  },

  updateCompany: async (
    updateData: UpdateCompanyRequest
  ): Promise<UpdateCompanyResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.COMPANYS.UPDATE, updateData);
    return response.data;
  },

  deleteCompany: async (
    companyId: string,
    hardDelete = false
  ): Promise<DeleteCompanyResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.COMPANYS.DELETE, {
      id: companyId,
      hardDelete,
    });
    return response.data;
  },

  getCompanies: async (
    params: GetCompaniesRequest
  ): Promise<GetCompaniesResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.COMPANYS.SEARCH, params);
    return response.data;
  },

  getCompanyById: async (companyId: string): Promise<GetCompanyByIdResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.COMPANYS.SEARCHBYID, {
      id: companyId,
    });
    return response.data;
  },
};
