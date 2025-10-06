// ==================== ENUMS ====================

export enum UserRole {
  SUPERADMIN = "superadmin",
  ADMIN = "admin",
  EXECUTIVE = "executive",
  CLIENT = "client",
}

export enum LoginType {
  EMAIL_PASSWORD = "email_password",
  GOOGLE = "google",
}

// ==================== BASE TYPES ====================

// Invited By User (populated)
export interface InvitedByUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isEmailVerified: boolean;
  requiresProfileCompletion?: boolean;
  isInvited?: boolean;
  invitedBy?: string | InvitedByUser; // Can be string (ID) or populated object
  lastLogin?: string;
  loginType?: LoginType;
  avatarURL?: string;
  createdAt?: string;
  updatedAt?: string;
}

// JWT Token Decoded Structure
export interface DecodedToken {
  _id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  isActive: boolean;
  requiresProfileCompletion?: boolean;
  iat: number;
  exp: number;
}

// ==================== PAGINATION ====================

export interface UserPagination {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ==================== API RESPONSE TYPES ====================

// Login Response - POST /api/v1/users/login
export interface LoginResponse {
  success: true;
  message: string;
  data: {
    user: User;
    token: string;
    requiresProfileCompletion: boolean;
  };
}

// Register Response - POST /api/v1/users/register
export interface RegisterResponse {
  success: true;
  message: string;
  data: {
    user: User;
  };
}

// Complete Profile Response - POST /api/v1/users/complete-profile
export interface CompleteProfileResponse {
  success: true;
  message: string;
  data: {
    user: User;
    token?: string; // Optional - if backend returns fresh JWT
  };
}

// Change Password Response - POST /api/v1/users/change-password
export interface ChangePasswordResponse {
  success: true;
  message: string;
}

// Logout Response - POST /api/v1/users/logout
export interface LogoutResponse {
  success: true;
  message: string;
}

// Invite User Response - POST /api/v1/users/invite
export interface InviteUserResponse {
  success: true;
  message: string;
  data: {
    email: string;
    role: UserRole;
  };
}

// Search Users Response - POST /api/v1/users/search
export interface SearchUsersResponse {
  success: true;
  data: User[];
  meta: UserPagination;
}

// Search User by ID Response - POST /api/v1/users/search-by-id
export interface SearchUserByIdResponse {
  success: true;
  data: User[];
  meta: UserPagination;
}

// Update User Response - POST /api/v1/users/update
export interface UpdateUserResponse {
  success: true;
  message: string;
  data: {
    user: User;
  };
}

// Delete User Response - POST /api/v1/users/delete
export interface DeleteUserResponse {
  success: true;
  message: string;
}

// Error Response
export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
}

// ==================== REQUEST TYPES ====================

// Login Request - POST /api/v1/users/login
export interface LoginRequest {
  email: string;
  password: string;
}

// Register Request - POST /api/v1/users/register
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  loginType: LoginType;
  role: UserRole;
  avatarURL?: string;
}

// Complete Profile Request - POST /api/v1/users/complete-profile
export interface CompleteProfileRequest {
  firstName: string;
  lastName: string;
  newPassword: string;
}

// Change Password Request - POST /api/v1/users/change-password
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Invite User Request - POST /api/v1/users/invite
export interface InviteUserRequest {
  email: string;
  role: UserRole;
}

// Search filters
export interface UserSearchFilters {
  role?: UserRole;
  email?: string; // partial match
  firstName?: string; // partial match
  isActive?: boolean;
  _id?: string; // for search by ID
}

// Search Users Request - POST /api/v1/users/search
export interface SearchUsersRequest {
  page?: number;
  limit?: number;
  search?: UserSearchFilters;
}

// Update User Request - POST /api/v1/users/update
export interface UpdateUserRequest {
  userId: string;
  updateData: {
    firstName?: string;
    lastName?: string;
    role?: UserRole | { $ne: UserRole }; // superadmin only
    email?: string; // superadmin only
    isActive?: boolean; // superadmin only
    avatarUrl?: string;
  };
}

// Delete User Request - POST /api/v1/users/delete
export interface DeleteUserRequest {
  userId: string;
}
