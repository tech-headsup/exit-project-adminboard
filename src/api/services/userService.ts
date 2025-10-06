import {
  InviteUserRequest,
  InviteUserResponse,
  SearchUsersRequest,
  SearchUsersResponse,
  SearchUserByIdResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  DeleteUserRequest,
  DeleteUserResponse,
} from "@/types/userTypes";
import apiClient from "../client";
import { API_ENDPOINTS } from "@/constant/apiEnpoints";

export const userService = {
  /**
   * Invite a new user (superadmin only)
   * @param inviteData - Email and role
   */
  inviteUser: async (
    inviteData: InviteUserRequest
  ): Promise<InviteUserResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.USERS.INVITE,
      inviteData
    );
    return response.data;
  },

  /**
   * Search users with pagination and filters
   * @param params - Page, limit, and search filters
   */
  searchUsers: async (
    params: SearchUsersRequest
  ): Promise<SearchUsersResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.USERS.SEARCH, params);
    return response.data;
  },

  /**
   * Search user by ID
   * @param userId - User ID
   */
  searchUserById: async (userId: string): Promise<SearchUserByIdResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.USERS.SEARCH_BY_ID, {
      search: { id: userId },
    });
    return response.data;
  },

  /**
   * Update user
   * @param updateData - User ID and update data
   */
  updateUser: async (
    updateData: UpdateUserRequest
  ): Promise<UpdateUserResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.USERS.UPDATE,
      updateData
    );
    return response.data;
  },

  /**
   * Delete user (superadmin only)
   * @param deleteData - User ID
   */
  deleteUser: async (
    deleteData: DeleteUserRequest
  ): Promise<DeleteUserResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.USERS.DELETE,
      deleteData
    );
    return response.data;
  },
};
