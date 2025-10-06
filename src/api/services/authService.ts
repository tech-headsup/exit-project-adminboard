import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  CompleteProfileRequest,
  CompleteProfileResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  LogoutResponse,
} from "@/types/userTypes";
import apiClient from "../client";
import { API_ENDPOINTS } from "@/constant/apiEnpoints";

export const authService = {
  /**
   * Login user
   * @param credentials - Email and password
   * @returns User data, token, and requiresProfileCompletion flag
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.USERS.LOGIN, credentials);
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<LogoutResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.USERS.LOGOUT, {});
    return response.data;
  },

  /**
   * Register superadmin user
   * @param userData - User registration data
   */
  register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.USERS.REGISTER, userData);
    return response.data;
  },

  /**
   * Complete profile for first-time invited users
   * @param profileData - First name, last name, and new password
   */
  completeProfile: async (
    profileData: CompleteProfileRequest
  ): Promise<CompleteProfileResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.USERS.COMPLETE_PROFILE,
      profileData
    );
    return response.data;
  },

  /**
   * Change user password
   * @param passwordData - Current password and new password
   */
  changePassword: async (
    passwordData: ChangePasswordRequest
  ): Promise<ChangePasswordResponse> => {
    const response = await apiClient.post(
      API_ENDPOINTS.USERS.CHANGE_PASSWORD,
      passwordData
    );
    return response.data;
  },
};
