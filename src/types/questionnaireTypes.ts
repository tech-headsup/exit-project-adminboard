import { Pagination } from "./companyTypes";

// ==================== ENUMS ====================

export enum QuestionType {
  TEXT = "TEXT",
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  RATING = "RATING",
  YES_NO = "YES_NO",
}

// ==================== BASE TYPES ====================

export interface PopulatedUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface RatingScale {
  min: number;
  max: number;
}

export interface Question {
  questionId: string; // ObjectId as string
  questionText: string;
  questionType: QuestionType;
  options?: string[]; // For MULTIPLE_CHOICE
  ratingScale?: RatingScale; // For RATING
  isRequired: boolean;
  order: number;
}

export interface Theme {
  themeId: string; // ObjectId as string
  themeName: string;
  themeDescription?: string;
  order: number;
  questions: Question[];
}

export interface Questionnaire {
  _id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  themes: Theme[];
  createdBy: string | PopulatedUser;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ==================== API RESPONSE TYPES ====================

// Create Questionnaire Response - POST /api/v1/questionnaire/create
export interface CreateQuestionnaireResponse {
  success: true;
  message: string;
  data: Questionnaire;
}

// Get Questionnaire Response - POST /api/v1/questionnaire/search-by-id
export interface GetQuestionnaireResponse {
  success: true;
  data: Questionnaire;
}

// Search Questionnaires Response - POST /api/v1/questionnaire/search
export interface SearchQuestionnairesResponse {
  success: true;
  data: {
    questionnaires: Questionnaire[];
    pagination: Pagination;
  };
}

// Update Questionnaire Response - POST /api/v1/questionnaire/update
export interface UpdateQuestionnaireResponse {
  success: true;
  message: string;
  data: Questionnaire;
}

// Delete Questionnaire Response - POST /api/v1/questionnaire/delete
export interface DeleteQuestionnaireResponse {
  success: true;
  message: string;
  data?: Questionnaire; // Returned on soft delete
}

// Duplicate Questionnaire Response - POST /api/v1/questionnaire/duplicate
export interface DuplicateQuestionnaireResponse {
  success: true;
  message: string;
  data: Questionnaire;
}

// ==================== REQUEST TYPES ====================

// Question input (without questionId for creation)
export interface QuestionInput {
  questionText: string;
  questionType: QuestionType;
  options?: string[]; // Required for MULTIPLE_CHOICE
  ratingScale?: RatingScale; // Required for RATING
  isRequired?: boolean; // Default: false
  order: number; // Required: 0, 1, 2...
}

// Theme input (without themeId for creation)
export interface ThemeInput {
  themeName: string;
  themeDescription?: string;
  order: number; // Required: 0, 1, 2...
  questions: QuestionInput[]; // At least 1 question required
}

// Create Questionnaire Request - POST /api/v1/questionnaire/create
export interface CreateQuestionnaireRequest {
  name: string; // Required
  description?: string; // Optional
  isDefault?: boolean; // Optional, default: false
  themes: ThemeInput[]; // Required, at least 1 theme
  createdBy: string; // Required: User ID
}

// Search filters for questionnaires
export interface QuestionnaireSearchFilters {
  isDefault?: boolean; // Filter default templates
  isActive?: boolean; // Filter active only
  createdBy?: string; // Filter by creator ID
  name?: string; // Search by name (uses $regex on backend)
}

// Sort options
export type QuestionnaireSortOptions = {
  createdAt?: 1 | -1;
  name?: 1 | -1;
};

// Search Questionnaires Request - POST /api/v1/questionnaire/search
export interface SearchQuestionnairesRequest {
  page?: number; // Optional, default: 1
  limit?: number; // Optional, default: 10
  search?: QuestionnaireSearchFilters; // Optional
  sort?: QuestionnaireSortOptions; // Optional
}

// Get Questionnaire Request - POST /api/v1/questionnaire/search-by-id
export interface GetQuestionnaireRequest {
  id: string; // Required: Questionnaire ObjectId
}

// Update Questionnaire Request - POST /api/v1/questionnaire/update
export interface UpdateQuestionnaireRequest {
  id: string; // Required: Questionnaire ObjectId
  name?: string; // Optional: New name
  description?: string; // Optional: New description
  isDefault?: boolean; // Optional: Change template status
  themes?: ThemeInput[]; // Optional: Replace all themes (warning: replaces entire structure)
}

// Delete Questionnaire Request - POST /api/v1/questionnaire/delete
export interface DeleteQuestionnaireRequest {
  id: string; // Required: Questionnaire ObjectId
  hardDelete?: boolean; // Optional: Permanent delete (default: false = soft delete)
}

// Duplicate Questionnaire Request - POST /api/v1/questionnaire/duplicate
export interface DuplicateQuestionnaireRequest {
  id: string; // Required: Source questionnaire ID
  name: string; // Required: New name for duplicated questionnaire
  createdBy: string; // Required: User ID
}

// ==================== LEGACY TYPES (For Backward Compatibility) ====================
// These are kept for backward compatibility with existing code
// TODO: Remove these once all components are updated to use new structure

export type GetQuestionnairesRequest = SearchQuestionnairesRequest;
export type GetQuestionnairesResponse = SearchQuestionnairesResponse;
export type GetGlobalTemplatesRequest = SearchQuestionnairesRequest;
export type GetGlobalTemplatesResponse = SearchQuestionnairesResponse;

// Note: The following types are removed as the APIs no longer exist:
// - AddQuestionRequest/Response
// - UpdateQuestionRequest/Response
// - DeleteQuestionRequest/Response
