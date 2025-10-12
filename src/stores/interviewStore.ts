import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  InterviewState,
  InterviewQuestionAnswer,
  InterviewThemeNote,
  AnswerValue,
} from "@/types/answerTypes";
import { QuestionType } from "@/types/questionnaireTypes";

interface InterviewStore extends InterviewState {
  // Actions
  initializeInterview: (
    candidateId: string,
    projectId: string,
    questionnaireId: string,
    startedAt: string
  ) => void;

  // Set individual question answer (NO notes)
  setQuestionAnswer: (
    themeId: string,
    themeName: string,
    questionId: string,
    questionText: string,
    questionType: QuestionType,
    answer: AnswerValue | ""
  ) => void;

  // Set theme-level notes (NO answer, NO questionId)
  setThemeNotes: (
    themeId: string,
    themeName: string,
    notes: string
  ) => void;

  setCurrentTheme: (themeId: string | null) => void;
  getQuestionAnswer: (themeId: string, questionId: string) => InterviewQuestionAnswer | undefined;
  getThemeNotes: (themeId: string) => InterviewThemeNote | undefined;
  getThemeProgress: (themeId: string, totalQuestions: number) => { answered: number; total: number; hasNotes: boolean };
  clearInterview: () => void;
  hasInterviewInProgress: () => boolean;
}

const initialState: InterviewState = {
  candidateId: "",
  projectId: "",
  questionnaireId: "",
  startedAt: "",
  answers: {},
  themeNotes: {},
  currentThemeId: null,
};

export const useInterviewStore = create<InterviewStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      initializeInterview: (candidateId, projectId, questionnaireId, startedAt) => {
        set({
          candidateId,
          projectId,
          questionnaireId,
          startedAt,
          answers: {},
          themeNotes: {},
          currentThemeId: null,
        });
      },

      setQuestionAnswer: (
        themeId,
        themeName,
        questionId,
        questionText,
        questionType,
        answer
      ) => {
        const key = `${themeId}_${questionId}`;
        const state = get();

        set({
          answers: {
            ...state.answers,
            [key]: {
              themeId,
              themeName,
              questionId,
              questionText,
              questionType,
              answer,
              answeredAt: new Date().toISOString(),
            },
          },
        });
      },

      setThemeNotes: (themeId, themeName, notes) => {
        const state = get();

        set({
          themeNotes: {
            ...state.themeNotes,
            [themeId]: {
              themeId,
              themeName,
              notes,
              updatedAt: new Date().toISOString(),
            },
          },
        });
      },

      setCurrentTheme: (themeId) => {
        set({ currentThemeId: themeId });
      },

      getQuestionAnswer: (themeId, questionId) => {
        const state = get();
        const key = `${themeId}_${questionId}`;
        return state.answers[key];
      },

      getThemeNotes: (themeId) => {
        const state = get();
        return state.themeNotes[themeId];
      },

      getThemeProgress: (themeId, totalQuestions) => {
        const state = get();

        // Count answered questions for this theme
        const themeAnswers = Object.values(state.answers).filter(
          (a) => a.themeId === themeId && a.answer !== ""
        );
        const answered = themeAnswers.length;

        // Check if theme has notes
        const hasNotes = !!state.themeNotes[themeId]?.notes;

        return { answered, total: totalQuestions, hasNotes };
      },

      clearInterview: () => {
        set(initialState);
      },

      hasInterviewInProgress: () => {
        const state = get();
        return !!state.candidateId && !!state.startedAt;
      },
    }),
    {
      name: "interview-storage", // localStorage key
      version: 2, // Increment version due to breaking changes
    }
  )
);
