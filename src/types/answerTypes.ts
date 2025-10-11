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
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Answer input for submission (before saving to DB)
export interface AnswerInput {
  themeId: string; // Required: ObjectId as string
  themeName: string; // Required
  questionId?: string; // Optional: ObjectId or null
  questionText?: string; // Optional
  questionType?: QuestionType; // Optional
  answer?: AnswerValue; // Optional: can be empty if notes provided
  notes?: string; // Optional: can be empty if answer provided
}

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
    totalAnswers: number;
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
