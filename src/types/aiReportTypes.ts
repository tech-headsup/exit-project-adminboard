// ==================== ENUMS ====================

export enum ReportStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum OverallSentiment {
  POSITIVE = "POSITIVE",
  NEUTRAL = "NEUTRAL",
  NEGATIVE = "NEGATIVE",
}

export enum RiskLevel {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export enum WouldReturnAnswer {
  YES = "YES",
  NO = "NO",
  MAYBE = "MAYBE",
}

// ==================== BASE TYPES ====================

export interface RatingQuestion {
  questionText: string;
  rating: number; // 1-10 scale
  isInferred: boolean; // true if AI inferred the rating, false if explicitly asked
}

export interface ThemeInsight {
  themeId: string;
  themeName: string;
  oneLiner: string; // Short quote/summary from candidate's perspective
  description: string; // Detailed narrative in first-person
  ratingQuestions: RatingQuestion[];
}

export interface SpecialInsights {
  leadershipStyle?: string; // e.g., "Democratic", "Autocratic"
  cultureSummary?: string;
  wouldReturn?: {
    answer: WouldReturnAnswer;
    reasoning: string;
  };
}

export interface GeneratedReport {
  executiveSummary: string;
  overallSentiment: OverallSentiment;
  keyFindings: string[];
  themeInsights: ThemeInsight[];
  specialInsights?: SpecialInsights;
  riskLevel: RiskLevel;
  recommendations: string[];
}

export interface AIReport {
  _id: string;
  candidateId: string;
  generatedReport: GeneratedReport;
  isEdited: boolean;
  editedBy?: string;
  editedAt?: Date | string;
  status: ReportStatus;
  createdAt: Date | string;
  updatedAt: Date | string;
  pdfDownloadCount?: number;
  lastPdfGeneratedAt?: Date | string;
}

// ==================== REQUEST TYPES ====================

// Check Report Status Request - POST /api/v1/ai-report/check-status
export interface CheckReportStatusRequest {
  candidateId: string;
}

// Get Report By Candidate Request - POST /api/v1/ai-report/get-by-candidate
export interface GetReportByCandidateRequest {
  candidateId: string;
}

// Update Report Request - POST /api/v1/ai-report/update
export interface UpdateReportRequest {
  reportId: string;
  editedBy: string;
  updatedReport: GeneratedReport;
}

// Generate PDF Request - POST /api/v1/ai-report/generate-pdf
export interface GeneratePDFRequest {
  candidateId: string;
}

// Regenerate Report Request - POST /api/v1/ai-report/regenerate
export interface RegenerateReportRequest {
  candidateId: string;
}

// ==================== RESPONSE TYPES ====================

// Check Report Status Response - POST /api/v1/ai-report/check-status
export interface CheckReportStatusResponse {
  success: true;
  data: {
    candidateId: string;
    status: ReportStatus;
    reportId?: string;
    generatedAt?: string;
    processingTimeMs?: number;
    error?: string | null;
  };
}

// Get Report By Candidate Response - POST /api/v1/ai-report/get-by-candidate
export interface GetReportByCandidateResponse {
  success: true;
  data: AIReport;
}

// Update Report Response - POST /api/v1/ai-report/update
export interface UpdateReportResponse {
  success: true;
  message: string;
  data: AIReport;
}

// Generate PDF Response - Returns Blob (not JSON)
// The response will be a PDF file blob that needs to be handled differently
export type GeneratePDFResponse = Blob;

// Regenerate Report Response - POST /api/v1/ai-report/regenerate
export interface RegenerateReportResponse {
  success: true;
  message: string;
  data: AIReport;
}
