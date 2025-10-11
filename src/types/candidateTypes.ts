import { Pagination } from "./companyTypes";

// ==================== ENUMS ====================

export enum OverallStatus {
  NEW = "NEW",
  ASSIGNED = "ASSIGNED",
  ATTEMPTING = "ATTEMPTING",
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  INTERVIEWED = "INTERVIEWED",
  DROPPED = "DROPPED",
  REPORT_GENERATED = "REPORT_GENERATED",
}

export enum InterviewStatus {
  NOT_STARTED = "NOT_STARTED",
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW",
  RESCHEDULED = "RESCHEDULED",
}

export enum CallStatus {
  ANSWERED_AGREED = "ANSWERED_AGREED",
  ANSWERED_DECLINED = "ANSWERED_DECLINED",
  NOT_ANSWERING = "NOT_ANSWERING",
  WRONG_NUMBER = "WRONG_NUMBER",
  SWITCHED_OFF = "SWITCHED_OFF",
  BUSY = "BUSY",
  CALLBACK_REQUESTED = "CALLBACK_REQUESTED",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum Quarter {
  Q1 = "Q1",
  Q2 = "Q2",
  Q3 = "Q3",
  Q4 = "Q4",
}

// ==================== BASE TYPES ====================

export interface PopulatedUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface InterviewDetails {
  scheduledDate?: Date | string;
  startedAt?: Date | string;
  completedAt?: Date | string;
  interviewDurationMinutes?: number;
  questionnaireId?: string;
  answersSubmitted?: boolean;
  completedThemes?: string[]; // Array of theme IDs that have been completed
}

export interface FollowupAttempt {
  attemptNumber: number;
  attemptTimestamp: Date;
  callStatus: CallStatus;
  notes?: string;
  scheduledInterviewDate?: Date;
  attemptedBy?: string | PopulatedUser;
}

export interface Candidate {
  _id: string;
  projectId: string;
  name: string;
  email: string;
  natureOfEmployment: string;
  location: string;
  gradeLevel: string;
  designation: string;
  department: string;
  reportingTo: string;
  dateOfJoining: Date;
  dob: Date;
  age: number;
  contactNumber: string;
  experienceInOrg: number;
  gender: Gender;
  resignationDate: Date;
  quarters: string;
  lastWorkingDay: Date;
  overallStatus: OverallStatus;
  assignedInterviewer?: string | PopulatedUser;
  uploadedBy: string | PopulatedUser;
  assignedBy?: string | PopulatedUser;
  assignedAt?: Date;
  interviewDetails: InterviewDetails;
  followupAttempts: FollowupAttempt[];
  maxFollowupAttempts: number;
  reportId?: string;
  reportGeneratedAt?: Date;
  uploadBatchId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Excel upload candidate row
export interface ExcelCandidateRow {
  Name: string;
  "Email ID": string;
  "Nature of Employment": string;
  Location: string;
  "Grade Level": string;
  Designation: string;
  Department: string;
  "Reporting to": string;
  "Date of Joining": string | number; // Can be DD-MM-YYYY string or Excel serial number
  DOB: string | number; // Can be DD-MM-YYYY string or Excel serial number
  Age: number;
  "Contact Number": string | number; // Can be string or number
  "Experience in Org": number;
  Gender: string;
  "Resignation Date": string | number; // Can be DD-MM-YYYY string or Excel serial number
  Quarters: string;
  "Last Working Day": string | number; // Can be DD-MM-YYYY string or Excel serial number
}

export interface CandidateError {
  rowNumber: number;
  candidateName: string;
  email: string;
  errors: string[];
}

export interface CandidateDuplicate {
  rowNumber: number;
  email: string;
}

// ==================== API RESPONSE TYPES ====================

// Upload Excel Response - POST /api/candidate/upload-excel
export interface UploadCandidatesResponse {
  success: true;
  message: string;
  data: {
    totalRows: number;
    successCount: number;
  };
}

// Upload Excel Error Response
export interface UploadCandidatesErrorResponse {
  success: false;
  error: string;
  data?: {
    totalRows: number;
    errorCount: number;
    duplicateCount: number;
    errors: CandidateError[];
    duplicates: CandidateDuplicate[];
  };
}

// Get Candidates Response - POST /api/candidate/get
export interface GetCandidatesResponse {
  success: true;
  data: {
    candidates: Candidate[];
    pagination: Pagination;
  };
}

// Get Candidate By ID Response - POST /api/candidate/getById
export interface GetCandidateByIdResponse {
  success: true;
  data: Candidate;
}

// Delete Candidate Response - POST /api/candidate/delete
export interface DeleteCandidateResponse {
  success: true;
  message: string;
  data?: Candidate;
}

// Assign Interviewer Response - POST /api/candidate/assign-interviewer
export interface AssignInterviewerResponse {
  success: true;
  message: string;
  data: {
    modifiedCount: number;
    projectId: string;
  };
}

// Auto Assign Interviewers Response - POST /api/candidate/auto-assign-interviewers
export interface AutoAssignInterviewersResponse {
  success: true;
  message: string;
  data: {
    totalCandidates: number;
    distribution: Array<{
      interviewerId: string;
      count: number;
    }>;
  };
}

// Update Followup Response - POST /api/candidate/update-followup
export interface UpdateFollowupResponse {
  success: true;
  message: string;
  data: Candidate;
}

// Update Interview Details Response - POST /api/candidate/update-interview-details
export interface UpdateInterviewDetailsResponse {
  success: true;
  message: string;
  data: Candidate;
}

// Update Overall Status Response - POST /api/candidate/update-status
export interface UpdateCandidateStatusResponse {
  success: true;
  message: string;
  data: Candidate;
}

// ==================== REQUEST TYPES ====================

// Upload Excel Request - POST /api/candidate/upload-excel
export interface UploadCandidatesRequest {
  projectId: string;
  uploadedBy: string;
  candidates: ExcelCandidateRow[];
}

// Search filter operators (MongoDB format)
export interface SearchOperators {
  $eq?: any;
  $contains?: string;
  $in?: any[];
  $gte?: string | number;
  $lte?: string | number;
  $gt?: string | number;
  $lt?: string | number;
  $ne?: any;
}

// Search filters
export type CandidateSearchFilters = {
  [K in keyof Partial<Candidate>]?: SearchOperators | string;
};

// Sort options
export type CandidateSortOptions = {
  [K in keyof Partial<Candidate>]?: 1 | -1;
};

// Get Candidates Request - POST /api/candidate/get
export interface GetCandidatesRequest {
  page?: number;
  limit?: number;
  search?: CandidateSearchFilters;
  sort?: CandidateSortOptions;
}

// Get Candidate By ID Request - POST /api/candidate/getById
export interface GetCandidateByIdRequest {
  id: string;
}

// Delete Candidate Request - POST /api/candidate/delete
export interface DeleteCandidateRequest {
  id: string;
  hardDelete?: boolean;
}

// Assign Interviewer Request - POST /api/candidate/assign-interviewer
export interface AssignInterviewerRequest {
  candidateIds: string[];
  interviewerId: string;
  assignedBy: string;
}

// Auto Assign Interviewers Request - POST /api/candidate/auto-assign-interviewers
export interface AutoAssignInterviewersRequest {
  projectId: string;
  interviewerIds: string[];
  assignedBy: string;
}

// Update Followup Request - POST /api/candidate/update-followup
export interface UpdateFollowupRequest {
  candidateId: string;
  attemptNumber: number;
  callStatus: CallStatus;
  notes?: string;
  scheduledInterviewDate?: string;
  attemptedBy: string;
}

// Update Interview Details Request - POST /api/candidate/update-interview-details
export interface UpdateInterviewDetailsRequest {
  candidateId: string;
  scheduledDate?: string;
  startedAt?: string;
  completedAt?: string;
  interviewDurationMinutes?: number;
  questionnaireId?: string;
  answersSubmitted?: boolean;
}

// Update Overall Status Request - POST /api/candidate/update-status
export interface UpdateCandidateStatusRequest {
  candidateId: string;
  overallStatus: OverallStatus;
}
