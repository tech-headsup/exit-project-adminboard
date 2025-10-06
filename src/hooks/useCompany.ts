import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { companyService } from "@/api/services/companyService";
import { queryKeys } from "@/utils/queryKeys";
import {
  CreateCompanyRequest,
  UpdateCompanyRequest,
  GetCompaniesRequest,
} from "@/types/companyTypes";

// ==================== QUERIES ====================

/**
 * Hook to fetch paginated/filtered companies
 * @param params - Search filters, pagination, and sort options
 */
export const useCompanies = (params: GetCompaniesRequest = {}) => {
  return useQuery({
    queryKey: queryKeys.companies.search(params),
    queryFn: () => companyService.getCompanies(params),
  });
};

/**
 * Hook to fetch a single company by ID
 * @param companyId - The company ID to fetch
 * @param enabled - Whether the query should run (default: true if companyId exists)
 */
export const useCompanyById = (companyId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.companies.searchById(companyId),
    queryFn: () => companyService.getCompanyById(companyId),
    enabled: !!companyId && enabled,
  });
};

// ==================== MUTATIONS ====================

/**
 * Hook to create a new company
 */
export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCompanyRequest) =>
      companyService.createCompany(data),
    onSuccess: () => {
      // Invalidate all company search queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
};

/**
 * Hook to update an existing company
 */
export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCompanyRequest) =>
      companyService.updateCompany(data),
    onSuccess: (response) => {
      // Invalidate specific company query
      queryClient.invalidateQueries({
        queryKey: queryKeys.companies.searchById(response.data._id),
      });
      // Invalidate all search queries
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
};

/**
 * Hook to delete a company
 * @param hardDelete - Whether to permanently delete (default: soft delete)
 */
export const useDeleteCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, hardDelete }: { id: string; hardDelete?: boolean }) =>
      companyService.deleteCompany(id, hardDelete),
    onSuccess: (_, variables) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: queryKeys.companies.searchById(variables.id),
      });
      // Invalidate all search queries
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all });
    },
  });
};
