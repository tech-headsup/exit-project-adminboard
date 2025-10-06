import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectService } from "@/api/services/projectService";
import { queryKeys } from "@/utils/queryKeys";
import {
  CreateProjectRequest,
  UpdateProjectRequest,
  GetProjectsRequest,
  GetProjectsByCompanyRequest,
  UpdateProjectStatusRequest,
  CheckProjectReadinessRequest,
  AssignUsersRequest,
} from "@/types/projectTypes";

// ==================== QUERIES ====================

/**
 * Hook to fetch paginated/filtered projects
 * @param params - Search filters, pagination, and sort options
 */
export const useProjects = (params: GetProjectsRequest = {}) => {
  return useQuery({
    queryKey: queryKeys.projects.list(params),
    queryFn: () => projectService.getProjects(params),
  });
};

/**
 * Hook to fetch a single project by ID
 * @param projectId - The project ID to fetch
 * @param enabled - Whether the query should run (default: true if projectId exists)
 */
export const useProjectById = (projectId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId),
    queryFn: () => projectService.getProjectById({ id: projectId }),
    enabled: !!projectId && enabled,
  });
};

/**
 * Hook to fetch projects by company
 * @param params - Company ID and optional filters
 */
export const useProjectsByCompany = (params: GetProjectsByCompanyRequest) => {
  return useQuery({
    queryKey: queryKeys.projects.byCompany(params),
    queryFn: () => projectService.getProjectsByCompany(params),
    enabled: !!params.companyId,
  });
};

/**
 * Hook to check project readiness
 * @param projectId - The project ID to check
 * @param enabled - Whether the query should run
 */
export const useProjectReadiness = (projectId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.projects.readiness(projectId),
    queryFn: () => projectService.checkProjectReadiness({ id: projectId }),
    enabled: !!projectId && enabled,
  });
};

// ==================== MUTATIONS ====================

/**
 * Hook to create a new project
 */
export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectRequest) =>
      projectService.createProject(data),
    onSuccess: () => {
      // Invalidate all project queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
};

/**
 * Hook to update an existing project
 */
export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProjectRequest) =>
      projectService.updateProject(data),
    onSuccess: (response) => {
      // Invalidate specific project query
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(response.data._id),
      });
      // Invalidate all project list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
};

/**
 * Hook to delete a project
 */
export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectService.deleteProject({ id }),
    onSuccess: (_, projectId) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: queryKeys.projects.detail(projectId),
      });
      // Invalidate all project queries
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
};

/**
 * Hook to update project status
 */
export const useUpdateProjectStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProjectStatusRequest) =>
      projectService.updateProjectStatus(data),
    onSuccess: (response) => {
      // Invalidate specific project query
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(response.data._id),
      });
      // Invalidate readiness check
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.readiness(response.data._id),
      });
      // Invalidate all project list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
};

/**
 * Hook to assign users to a project
 */
export const useAssignUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignUsersRequest) =>
      projectService.assignUsers(data),
    onSuccess: (response) => {
      // Invalidate specific project query
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(response.data._id),
      });
      // Invalidate readiness check
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.readiness(response.data._id),
      });
      // Invalidate all project list queries
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
    },
  });
};
