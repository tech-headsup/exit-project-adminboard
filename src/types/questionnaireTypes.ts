import { Pagination } from "./companyTypes";

// ==================== ENUMS ====================

export enum QuestionnaireType {
  EXIT = "EXIT",
  OFFER_DROPOUT = "OFFER_DROPOUT",
  STAY = "STAY",
}

export enum QuestionType {
  TEXT = "TEXT",
  RADIO = "RADIO",
  CHECKBOX = "CHECKBOX",
  RATING = "RATING",
}

// ==================== BASE TYPES ====================

export interface Question {
  _id: string;
  questionText: string;
  questionType: QuestionType;
  isRequired: boolean;
  options?: string[];
}

export interface Theme {
  _id: string;
  themeName: string;
  questions: Question[];
}

export interface Questionnaire {
  _id: string;
  questionnaireType: QuestionnaireType;
  questionnaireName: string;
  themes: Theme[];
  isGlobalTemplate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== API RESPONSE TYPES ====================

// Create Questionnaire Response - POST /api/questionnaire/create
export interface CreateQuestionnaireResponse {
  success: true;
  data: Questionnaire;
}

// Get Questionnaire Response - POST /api/questionnaire/get
export interface GetQuestionnaireResponse {
  success: true;
  data?: Questionnaire;
  message?: string;
}

// Get All Questionnaires Response - POST /api/questionnaire/get-all
export interface GetQuestionnairesResponse {
  success: true;
  data: {
    questionnaires: Questionnaire[];
    pagination: Pagination;
  };
}

// Get Global Templates Response - POST /api/questionnaire/get-global-templates
export interface GetGlobalTemplatesResponse {
  success: true;
  data: {
    questionnaires: Questionnaire[];
    pagination: Pagination;
  };
}

// Delete Questionnaire Response - POST /api/questionnaire/delete
export interface DeleteQuestionnaireResponse {
  success: true;
  message: string;
}

// Duplicate Questionnaire Response - POST /api/questionnaire/duplicate
export interface DuplicateQuestionnaireResponse {
  success: true;
  data: Questionnaire;
  message: string;
}

// Add Question Response - POST /api/questionnaire/add-question
export interface AddQuestionResponse {
  success: true;
  data: Questionnaire;
  message: string;
}

// Update Question Response - POST /api/questionnaire/update-question
export interface UpdateQuestionResponse {
  success: true;
  data: Questionnaire;
  message: string;
}

// Delete Question Response - POST /api/questionnaire/delete-question
export interface DeleteQuestionResponse {
  success: true;
  data: Questionnaire;
  message: string;
}

// ==================== REQUEST TYPES ====================

// Question input (without _id for creation)
export interface QuestionInput {
  questionText: string;
  questionType: QuestionType;
  isRequired?: boolean;
  options?: string[];
}

// Theme input (without _id for creation)
export interface ThemeInput {
  themeName: string;
  questions: QuestionInput[];
}

// Create Questionnaire Request - POST /api/questionnaire/create
export interface CreateQuestionnaireRequest {
  questionnaireType: QuestionnaireType;
  themes: ThemeInput[];
  isGlobalTemplate?: boolean;
}

// Search filter operators
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
export type QuestionnaireSearchFilters = {
  [K in keyof Partial<Questionnaire>]?: SearchOperators | string | boolean;
};

// Sort options
export type QuestionnaireSortOptions = {
  [K in keyof Partial<Questionnaire>]?: 1 | -1;
};

// Get Questionnaire Request - POST /api/questionnaire/get
export interface GetQuestionnaireRequest {
  id: string;
}

// Get All Questionnaires Request - POST /api/questionnaire/get-all
export interface GetQuestionnairesRequest {
  page?: number;
  limit?: number;
  search?: QuestionnaireSearchFilters;
  sort?: QuestionnaireSortOptions;
}

// Get Global Templates Request - POST /api/questionnaire/get-global-templates
export interface GetGlobalTemplatesRequest {
  page?: number;
  limit?: number;
  search?: QuestionnaireSearchFilters;
  sort?: QuestionnaireSortOptions;
}

// Delete Questionnaire Request - POST /api/questionnaire/delete
export interface DeleteQuestionnaireRequest {
  id: string;
}

// Duplicate Questionnaire Request - POST /api/questionnaire/duplicate
export interface DuplicateQuestionnaireRequest {
  questionnaireId: string;
}

// Add Question Request - POST /api/questionnaire/add-question
export interface AddQuestionRequest {
  questionnaireId: string;
  themeId: string;
  question: QuestionInput;
}

// Update Question Request - POST /api/questionnaire/update-question
export interface UpdateQuestionRequest {
  questionnaireId: string;
  themeId: string;
  questionId: string;
  updates: Partial<QuestionInput>;
}

// Delete Question Request - POST /api/questionnaire/delete-question
export interface DeleteQuestionRequest {
  questionnaireId: string;
  themeId: string;
  questionId: string;
}
