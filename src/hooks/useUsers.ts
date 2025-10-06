import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/api/services/userService";
import { queryKeys } from "@/utils/queryKeys";
import {
  InviteUserRequest,
  SearchUsersRequest,
  UpdateUserRequest,
  DeleteUserRequest,
} from "@/types/userTypes";

// ==================== QUERIES ====================

/**
 * Hook to fetch paginated/filtered users
 * @param params - Search filters, pagination options
 */
export const useSearchUsers = (params: SearchUsersRequest = {}) => {
  return useQuery({
    queryKey: queryKeys.users.search(params),
    queryFn: () => userService.searchUsers(params),
  });
};

/**
 * Hook to fetch a single user by ID
 * @param userId - The user ID to fetch
 * @param enabled - Whether the query should run (default: true if userId exists)
 */
export const useSearchUserById = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.users.searchById(userId),
    queryFn: () => userService.searchUserById(userId),
    enabled: !!userId && enabled,
  });
};

// ==================== MUTATIONS ====================

/**
 * Hook to invite a new user (superadmin only)
 */
export const useInviteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteUserRequest) => userService.inviteUser(data),
    onSuccess: () => {
      // Invalidate all user search queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};

/**
 * Hook to update an existing user
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserRequest) => userService.updateUser(data),
    onSuccess: (response) => {
      // Invalidate specific user query
      queryClient.invalidateQueries({
        queryKey: queryKeys.users.searchById(response.data.user._id),
      });
      // Invalidate all search queries
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};

/**
 * Hook to delete a user (superadmin only)
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeleteUserRequest) => userService.deleteUser(data),
    onSuccess: (_, variables) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: queryKeys.users.searchById(variables.userId),
      });
      // Invalidate all search queries
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};
