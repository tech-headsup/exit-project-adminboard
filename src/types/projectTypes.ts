import { Pagination } from "./companyTypes";

// ==================== ENUMS ====================

export enum ProjectType {
  EXIT = "EXIT",
  OFFER_DROPOUT = "OFFER_DROPOUT",
  STAY = "STAY",
}

export enum ProjectStatus {
  PLANNING = "PLANNING",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  ON_HOLD = "ON_HOLD",
}

// ==================== BASE TYPES ====================

export interface PopulatedCompany {
  _id: string;
  nameOfCompany: string;
  companyEmail: string;
  industry: string;
  companySize?: string;
  companyLogo?: string;
  companyThemeColor?: string;
  companyContactNo?: string;
  companyWebsiteURL?: string;
}

export interface PopulatedUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Project {
  _id: string;
  companyId: string | PopulatedCompany;
  projectName: string;
  projectType: ProjectType;
  projectStatus: ProjectStatus;
  noOfEmployees: number;
  questionnaireId?: string;
  headsUpSpocIds: string[] | PopulatedUser[];
  clientSpocIds: string[] | PopulatedUser[];
  interviewerIds: string[] | PopulatedUser[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectReadinessCheck {
  questionnaireAssigned: boolean;
  candidatesUploaded: boolean;
  allCandidatesAssigned: boolean;
  clientSpocAssigned: boolean;
  headsUpSpocAssigned: boolean;
}

// ==================== API RESPONSE TYPES ====================

// Create Project Response - POST /api/project/create
export interface CreateProjectResponse {
  success: true;
  message: string;
  data: Project;
}

// Get Project Response - POST /api/project/get (single project)
export interface GetProjectResponse {
  success: true;
  data: Project;
}

// Get Projects Response - POST /api/project/get (with pagination)
export interface GetProjectsResponse {
  success: true;
  data: {
    projects: Project[];
    pagination: Pagination;
  };
}

// Get Projects By Company Response - POST /api/project/get-by-company
export interface GetProjectsByCompanyResponse {
  success: true;
  data: Project[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// Update Project Response - POST /api/project/update
export interface UpdateProjectResponse {
  success: true;
  message: string;
  data: Project;
}

// Delete Project Response - POST /api/project/delete
export interface DeleteProjectResponse {
  success: true;
  message: string;
}

// Update Project Status Response - POST /api/project/update-status
export interface UpdateProjectStatusResponse {
  success: true;
  message: string;
  data: Project;
}

// Check Project Readiness Response - POST /api/project/check-readiness
export interface CheckProjectReadinessResponse {
  success: true;
  data: {
    isReady: boolean;
    checks: ProjectReadinessCheck;
    blockers: string[];
    message: string;
  };
}

// Assign Users Response - POST /api/project/assign-users
export interface AssignUsersResponse {
  success: true;
  message: string;
  data: Project;
}

// ==================== REQUEST TYPES ====================

// Create Project Request - POST /api/project/create
export interface CreateProjectRequest {
  companyId: string;
  projectName: string;
  projectType: ProjectType;
  noOfEmployees: number;
  questionnaireId?: string;
  headsUpSpocIds?: string[];
  clientSpocIds?: string[];
  interviewerIds?: string[];
}

// Search filter operators (reusing from company)
export interface SearchOperators {
  eq?: any;
  contains?: string;
  in?: any[];
  gte?: string | number;
  lte?: string | number;
  gt?: string | number;
  lt?: string | number;
  ne?: any;
}

// Search filters
export type ProjectSearchFilters = {
  [K in keyof Partial<Project>]?: SearchOperators | string;
};

// Sort options
export type ProjectSortOptions = {
  [K in keyof Partial<Project>]?: 1 | -1;
};

// Get Projects Request - POST /api/project/get
export interface GetProjectsRequest {
  page?: number;
  limit?: number;
  search?: ProjectSearchFilters;
  sort?: ProjectSortOptions;
}

// Get Project By ID Request - POST /api/project/get
export interface GetProjectByIdRequest {
  id: string;
}

// Get Projects By Company Request - POST /api/project/get-by-company
export interface GetProjectsByCompanyRequest {
  companyId: string;
  page?: number;
  limit?: number;
  projectStatus?: ProjectStatus;
}

// Update Project Request - POST /api/project/update
export interface UpdateProjectRequest {
  id: string;
  projectName?: string;
  projectType?: ProjectType;
  noOfEmployees?: number;
  questionnaireId?: string;
  headsUpSpocIds?: string[];
  clientSpocIds?: string[];
  interviewerIds?: string[];
}

// Delete Project Request - POST /api/project/delete
export interface DeleteProjectRequest {
  id: string;
}

// Update Project Status Request - POST /api/project/update-status
export interface UpdateProjectStatusRequest {
  id: string;
  projectStatus: ProjectStatus;
}

// Check Readiness Request - POST /api/project/check-readiness
export interface CheckProjectReadinessRequest {
  id: string;
}

// Assign Users Request - POST /api/project/assign-users
export interface AssignUsersRequest {
  id: string;
  headsUpSpocIds?: string[];
  clientSpocIds?: string[];
  interviewerIds?: string[];
}
