import { create } from "zustand";
import {
  GeneratedReport,
  ThemeInsight,
  RatingQuestion,
  OverallSentiment,
  WouldReturnAnswer,
  RiskLevel
} from "@/types/aiReportTypes";

interface ReportEditorState {
  // Edit mode flag
  isEditMode: boolean;

  // Current edited report (null when not editing)
  editedReport: GeneratedReport | null;

  // Report metadata
  reportId: string | null;
  candidateId: string | null;
}

interface ReportEditorStore extends ReportEditorState {
  // Actions
  startEditing: (reportId: string, candidateId: string, report: GeneratedReport) => void;
  cancelEditing: () => void;

  // Update individual fields
  updateExecutiveSummary: (summary: string) => void;
  updateOverallSentiment: (sentiment: OverallSentiment) => void;

  // Key findings
  updateKeyFinding: (index: number, value: string) => void;
  addKeyFinding: () => void;
  removeKeyFinding: (index: number) => void;

  // Theme insights
  updateThemeInsight: (themeIndex: number, field: keyof Omit<ThemeInsight, "ratingQuestions">, value: string) => void;
  updateRatingQuestion: (themeIndex: number, ratingIndex: number, field: keyof RatingQuestion, value: any) => void;

  // Special insights
  updateLeadershipStyle: (style: string) => void;
  updateCultureSummary: (summary: string) => void;
  updateWouldReturn: (answer: WouldReturnAnswer, reasoning: string) => void;

  // Risk and recommendations
  updateRiskLevel: (level: RiskLevel) => void;
  updateRecommendation: (index: number, value: string) => void;
  addRecommendation: () => void;
  removeRecommendation: (index: number) => void;

  // Get edited report
  getEditedReport: () => GeneratedReport | null;
}

const initialState: ReportEditorState = {
  isEditMode: false,
  editedReport: null,
  reportId: null,
  candidateId: null,
};

export const useReportStore = create<ReportEditorStore>()((set, get) => ({
  ...initialState,

  // Start editing
  startEditing: (reportId, candidateId, report) => {
    set({
      isEditMode: true,
      reportId,
      candidateId,
      // Deep clone the report to avoid mutations
      editedReport: JSON.parse(JSON.stringify(report)),
    });
  },

  // Cancel editing
  cancelEditing: () => {
    set(initialState);
  },

  // Update executive summary
  updateExecutiveSummary: (summary) => {
    const state = get();
    if (!state.editedReport) return;

    set({
      editedReport: {
        ...state.editedReport,
        executiveSummary: summary,
      },
    });
  },

  // Update overall sentiment
  updateOverallSentiment: (sentiment) => {
    const state = get();
    if (!state.editedReport) return;

    set({
      editedReport: {
        ...state.editedReport,
        overallSentiment: sentiment,
      },
    });
  },

  // Update key finding
  updateKeyFinding: (index, value) => {
    const state = get();
    if (!state.editedReport) return;

    const keyFindings = [...state.editedReport.keyFindings];
    keyFindings[index] = value;

    set({
      editedReport: {
        ...state.editedReport,
        keyFindings,
      },
    });
  },

  // Add key finding
  addKeyFinding: () => {
    const state = get();
    if (!state.editedReport) return;

    set({
      editedReport: {
        ...state.editedReport,
        keyFindings: [...state.editedReport.keyFindings, ""],
      },
    });
  },

  // Remove key finding
  removeKeyFinding: (index) => {
    const state = get();
    if (!state.editedReport) return;

    const keyFindings = state.editedReport.keyFindings.filter((_, i) => i !== index);

    set({
      editedReport: {
        ...state.editedReport,
        keyFindings,
      },
    });
  },

  // Update theme insight field
  updateThemeInsight: (themeIndex, field, value) => {
    const state = get();
    if (!state.editedReport) return;

    const themeInsights = [...state.editedReport.themeInsights];
    themeInsights[themeIndex] = {
      ...themeInsights[themeIndex],
      [field]: value,
    };

    set({
      editedReport: {
        ...state.editedReport,
        themeInsights,
      },
    });
  },

  // Update rating question
  updateRatingQuestion: (themeIndex, ratingIndex, field, value) => {
    const state = get();
    if (!state.editedReport) return;

    const themeInsights = [...state.editedReport.themeInsights];
    const ratingQuestions = [...themeInsights[themeIndex].ratingQuestions];

    ratingQuestions[ratingIndex] = {
      ...ratingQuestions[ratingIndex],
      [field]: value,
    };

    themeInsights[themeIndex] = {
      ...themeInsights[themeIndex],
      ratingQuestions,
    };

    set({
      editedReport: {
        ...state.editedReport,
        themeInsights,
      },
    });
  },

  // Update leadership style
  updateLeadershipStyle: (style) => {
    const state = get();
    if (!state.editedReport) return;

    set({
      editedReport: {
        ...state.editedReport,
        specialInsights: {
          ...state.editedReport.specialInsights,
          leadershipStyle: style,
        },
      },
    });
  },

  // Update culture summary
  updateCultureSummary: (summary) => {
    const state = get();
    if (!state.editedReport) return;

    set({
      editedReport: {
        ...state.editedReport,
        specialInsights: {
          ...state.editedReport.specialInsights,
          cultureSummary: summary,
        },
      },
    });
  },

  // Update would return
  updateWouldReturn: (answer, reasoning) => {
    const state = get();
    if (!state.editedReport) return;

    set({
      editedReport: {
        ...state.editedReport,
        specialInsights: {
          ...state.editedReport.specialInsights,
          wouldReturn: {
            answer,
            reasoning,
          },
        },
      },
    });
  },

  // Update risk level
  updateRiskLevel: (level) => {
    const state = get();
    if (!state.editedReport) return;

    set({
      editedReport: {
        ...state.editedReport,
        riskLevel: level,
      },
    });
  },

  // Update recommendation
  updateRecommendation: (index, value) => {
    const state = get();
    if (!state.editedReport) return;

    const recommendations = [...state.editedReport.recommendations];
    recommendations[index] = value;

    set({
      editedReport: {
        ...state.editedReport,
        recommendations,
      },
    });
  },

  // Add recommendation
  addRecommendation: () => {
    const state = get();
    if (!state.editedReport) return;

    set({
      editedReport: {
        ...state.editedReport,
        recommendations: [...state.editedReport.recommendations, ""],
      },
    });
  },

  // Remove recommendation
  removeRecommendation: (index) => {
    const state = get();
    if (!state.editedReport) return;

    const recommendations = state.editedReport.recommendations.filter((_, i) => i !== index);

    set({
      editedReport: {
        ...state.editedReport,
        recommendations,
      },
    });
  },

  // Get edited report
  getEditedReport: () => {
    return get().editedReport;
  },
}));
