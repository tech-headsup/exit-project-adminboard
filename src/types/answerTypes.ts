import { Pagination } from "./companyTypes";
import { QuestionType } from "./questionnaireTypes";

// ==================== BASE TYPES ====================

export interface PopulatedUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// Answer value can be string, string array (for MULTIPLE_CHOICE), or number (for RATING)
export type AnswerValue = string | string[] | number;

export interface Answer {
  _id: string;
  candidateId: string;
  projectId: string;
  questionnaireId: string;
  themeId: string;
  themeName: string;
  questionId?: string; // Optional: null if only notes provided for theme
  questionText?: string;
  questionType?: QuestionType;
  answer?: AnswerValue; // Optional: can be empty if notes provided
  notes?: string; // Optional: can be empty if answer provided
  submittedAt: Date | string;
  submittedBy: string | PopulatedUser;
  lastEditedAt?: Date | string; // Auto-updated on edits
  isActive?: boolean; // For soft delete
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ==================== NEW STRUCTURE (v2.0) ====================

// Individual question answer (with questionId, NO notes allowed)
export interface IndividualAnswerInput {
  themeId: string; // Required
  themeName: string; // Required
  questionId: string; // Required
  questionText: string; // Required
  questionType: QuestionType; // Required
  answer: AnswerValue; // Required
  // notes: NOT ALLOWED
}

// Theme-level notes (NO questionId, NO answer allowed)
export interface ThemeNoteInput {
  themeId: string; // Required
  themeName: string; // Required
  questionId: null; // Must be null
  questionText: null; // Must be null
  questionType: null; // Must be null
  answer: null; // Must be null
  notes: string; // Required
}

// Union type for submission (can be either individual answer or theme note)
export type AnswerInput = IndividualAnswerInput | ThemeNoteInput;

// Grouped answers by theme
export interface ThemeAnswers {
  themeId: string;
  themeName: string;
  answers: Answer[];
}

// ==================== API RESPONSE TYPES ====================

// Submit Interview Answers Response - POST /api/v1/answer/submit-interview-answers
export interface SubmitInterviewAnswersResponse {
  success: true;
  message: string;
  data: {
    candidateId: string;
    totalDocuments: number; // Total answer documents created
    individualAnswers: number; // Number of individual question answers
    themeNotes: number; // Number of theme-level notes
    totalThemes: number;
    completedThemes: number;
    overallStatus: string; // "INTERVIEWED"
    inserted: number;
  };
}

// Submit Interview Answers Error Response
export interface SubmitInterviewAnswersErrorResponse {
  success: false;
  error: string;
  data?: {
    missingThemes?: string[];
    totalThemes?: number;
    coveredThemes?: number;
  };
}

// Get Answers By Candidate Response - POST /api/v1/answer/get-by-candidate
export interface GetAnswersByCandidateResponse {
  success: true;
  data: {
    candidateId: string;
    themes: ThemeAnswers[];
    totalAnswers: number;
  };
}

// Get Answers By Project Response - POST /api/v1/answer/get-by-project
export interface GetAnswersByProjectResponse {
  success: true;
  data: {
    answers: Answer[];
    pagination: Pagination;
  };
}

// Get Answer By ID Response - POST /api/v1/answer/search-by-id
export interface GetAnswerByIdResponse {
  success: true;
  data: Answer;
}

// Update Answer Response - POST /api/v1/answer/update
export interface UpdateAnswerResponse {
  success: true;
  message: string;
  data: Answer;
}

// Delete Answer Response - POST /api/v1/answer/delete
export interface DeleteAnswerResponse {
  success: true;
  message: string;
  data?: Answer; // Returned on soft delete
}

// Submit Bulk Answers Response - POST /api/v1/answer/submit-bulk
export interface SubmitBulkAnswersResponse {
  success: true;
  message: string;
  data: {
    totalAnswers: number;
    inserted: number;
    updated: number;
  };
}

// ==================== REQUEST TYPES ====================

// Submit Interview Answers Request - POST /api/v1/answer/submit-interview-answers
export interface SubmitInterviewAnswersRequest {
  candidateId: string; // Required
  projectId: string; // Required
  questionnaireId: string; // Required
  answers: AnswerInput[]; // Required: array of answers
  submittedBy: string; // Required: Interviewer ID
  completedAt: string; // Required: ISO date string
  interviewDurationMinutes: number; // Required
}

// Get Answers By Candidate Request - POST /api/v1/answer/get-by-candidate
export interface GetAnswersByCandidateRequest {
  candidateId: string; // Required
  themeId?: string; // Optional: filter by specific theme
}

// Get Answers By Project Request - POST /api/v1/answer/get-by-project
export interface GetAnswersByProjectRequest {
  projectId: string; // Required
  page?: number; // Optional, default: 1
  limit?: number; // Optional, default: 100
  themeId?: string; // Optional: filter by theme
}

// Get Answer By ID Request - POST /api/v1/answer/search-by-id
export interface GetAnswerByIdRequest {
  id: string; // Required: Answer ObjectId
}

// Update Answer Request - POST /api/v1/answer/update
export interface UpdateAnswerRequest {
  id: string; // Required: Answer ObjectId
  answer?: AnswerValue; // Optional: New answer value
  notes?: string; // Optional: New notes
}

// Delete Answer Request - POST /api/v1/answer/delete
export interface DeleteAnswerRequest {
  id: string; // Required: Answer ObjectId
  hardDelete?: boolean; // Optional: Permanent delete (default: false = soft delete)
}

// Submit Bulk Answers Request - POST /api/v1/answer/submit-bulk
export interface SubmitBulkAnswersRequest {
  candidateId: string; // Required
  projectId: string; // Required
  questionnaireId: string; // Required
  answers: AnswerInput[]; // Required: array of answers
  submittedBy: string; // Required: Interviewer ID
}

// ==================== INTERVIEW STATE TYPES (for Zustand) ====================

// Individual question answer in Zustand (NO notes)
export interface InterviewQuestionAnswer {
  themeId: string;
  themeName: string;
  questionId: string; // Required
  questionText: string;
  questionType: QuestionType;
  answer: AnswerValue | ""; // Empty string if not yet answered
  answeredAt?: string; // Timestamp when answered
}

// Theme note in Zustand (NO answer, NO questionId)
export interface InterviewThemeNote {
  themeId: string;
  themeName: string;
  notes: string; // Can be empty string if not yet filled
  updatedAt?: string; // Timestamp when last updated
}

// Interview state stored in Zustand + localStorage
export interface InterviewState {
  candidateId: string;
  projectId: string;
  questionnaireId: string;
  startedAt: string; // ISO timestamp
  answers: Record<string, InterviewQuestionAnswer>; // Key: `${themeId}_${questionId}`
  themeNotes: Record<string, InterviewThemeNote>; // Key: `${themeId}`
  currentThemeId: string | null; // Currently active theme
}
