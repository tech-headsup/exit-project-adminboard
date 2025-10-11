import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  InterviewState,
  InterviewAnswer,
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
  setAnswer: (
    themeId: string,
    themeName: string,
    questionId: string | null,
    questionText: string,
    questionType: QuestionType | "",
    answer: AnswerValue | "",
    notes: string
  ) => void;
  setCurrentTheme: (themeId: string | null) => void;
  getAnswer: (themeId: string, questionId: string | null) => InterviewAnswer | undefined;
  getThemeProgress: (themeId: string) => { answered: number; total: number };
  clearInterview: () => void;
  hasInterviewInProgress: () => boolean;
}

const initialState: InterviewState = {
  candidateId: "",
  projectId: "",
  questionnaireId: "",
  startedAt: "",
  answers: {},
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
          currentThemeId: null,
        });
      },

      setAnswer: (
        themeId,
        themeName,
        questionId,
        questionText,
        questionType,
        answer,
        notes
      ) => {
        const key = questionId ? `${themeId}_${questionId}` : `${themeId}_notes`;
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
              notes,
              answeredAt: new Date().toISOString(),
            },
          },
        });
      },

      setCurrentTheme: (themeId) => {
        set({ currentThemeId: themeId });
      },

      getAnswer: (themeId, questionId) => {
        const state = get();
        const key = questionId ? `${themeId}_${questionId}` : `${themeId}_notes`;
        return state.answers[key];
      },

      getThemeProgress: (themeId) => {
        const state = get();
        const themeAnswers = Object.values(state.answers).filter(
          (a) => a.themeId === themeId
        );
        const answered = themeAnswers.filter(
          (a) => a.answer !== "" || a.notes !== ""
        ).length;
        return { answered, total: themeAnswers.length };
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
      version: 1,
    }
  )
);
