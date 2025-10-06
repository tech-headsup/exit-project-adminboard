import {
  CreateProjectRequest,
  CreateProjectResponse,
  GetProjectsRequest,
  GetProjectsResponse,
  GetProjectByIdRequest,
  GetProjectResponse,
  GetProjectsByCompanyRequest,
  GetProjectsByCompanyResponse,
  UpdateProjectRequest,
  UpdateProjectResponse,
  DeleteProjectRequest,
  DeleteProjectResponse,
  UpdateProjectStatusRequest,
  UpdateProjectStatusResponse,
  CheckProjectReadinessRequest,
  CheckProjectReadinessResponse,
  AssignUsersRequest,
  AssignUsersResponse,
} from "@/types/projectTypes";
import apiClient from "../client";
import { API_ENDPOINTS } from "@/constant/apiEnpoints";

export const projectService = {
  // Create a new project
  createProject: async (
    projectData: CreateProjectRequest
  ): Promise<CreateProjectResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.PROJECTS.CREATE,
      projectData
    );
    return response.data;
  },

  // Get projects with pagination/filtering/sorting
  getProjects: async (
    params: GetProjectsRequest
  ): Promise<GetProjectsResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.PROJECTS.GET, params);
    return response.data;
  },

  // Get a single project by ID
  getProjectById: async (
    params: GetProjectByIdRequest
  ): Promise<GetProjectResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.PROJECTS.GET_BY_ID,
      params
    );
    return response.data;
  },

  // Get projects by company
  getProjectsByCompany: async (
    params: GetProjectsByCompanyRequest
  ): Promise<GetProjectsByCompanyResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.PROJECTS.GET_BY_COMPANY,
      params
    );
    return response.data;
  },

  // Update a project
  updateProject: async (
    updateData: UpdateProjectRequest
  ): Promise<UpdateProjectResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.PROJECTS.UPDATE,
      updateData
    );
    return response.data;
  },

  // Delete a project
  deleteProject: async (
    params: DeleteProjectRequest
  ): Promise<DeleteProjectResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.PROJECTS.DELETE,
      params
    );
    return response.data;
  },

  // Update project status
  updateProjectStatus: async (
    params: UpdateProjectStatusRequest
  ): Promise<UpdateProjectStatusResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.PROJECTS.UPDATE_STATUS,
      params
    );
    return response.data;
  },

  // Check project readiness
  checkProjectReadiness: async (
    params: CheckProjectReadinessRequest
  ): Promise<CheckProjectReadinessResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.PROJECTS.CHECK_READINESS,
      params
    );
    return response.data;
  },

  // Assign users to project
  assignUsers: async (
    params: AssignUsersRequest
  ): Promise<AssignUsersResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.PROJECTS.ASSIGN_USERS,
      params
    );
    return response.data;
  },
};
