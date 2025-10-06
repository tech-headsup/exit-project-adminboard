import { useMutation } from "@tanstack/react-query";
import { authService } from "@/api/services/authService";
import {
  LoginRequest,
  RegisterRequest,
  CompleteProfileRequest,
  ChangePasswordRequest,
} from "@/types/userTypes";

// ==================== MUTATIONS ====================

/**
 * Hook to login user
 */
export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
  });
};

/**
 * Hook to logout user
 */
export const useLogout = () => {
  return useMutation({
    mutationFn: () => authService.logout(),
  });
};

/**
 * Hook to register superadmin user
 */
export const useRegister = () => {
  return useMutation({
    mutationFn: (userData: RegisterRequest) => authService.register(userData),
  });
};

/**
 * Hook to complete profile for first-time invited users
 */
export const useCompleteProfile = () => {
  return useMutation({
    mutationFn: (profileData: CompleteProfileRequest) =>
      authService.completeProfile(profileData),
  });
};

/**
 * Hook to change user password
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (passwordData: ChangePasswordRequest) =>
      authService.changePassword(passwordData),
  });
};
