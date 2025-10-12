"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Loader2,
  CheckCircle2,
  Circle,
  PlayCircle,
  Send,
  Calendar,
  Clock,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useInterviewStore } from "@/stores/interviewStore";
import { QuestionRenderer } from "./QuestionRenderer";
import { Theme } from "@/types/questionnaireTypes";
import { IndividualAnswerInput, ThemeNoteInput } from "@/types/answerTypes";
import { Candidate, OverallStatus } from "@/types/candidateTypes";

// React Query Hooks
import { useQuestionnaireById } from "@/hooks/useQuestionnaire";
import {
  useAnswersByCandidate,
  useSubmitInterviewAnswers,
  useUpdateAnswer,
  useSubmitBulkAnswers,
} from "@/hooks/useAnswer";
import {
  useUpdateInterviewDetails,
  useUpdateCandidateStatus,
} from "@/hooks/useCandidate";

interface InterviewQnATabProps {
  candidate: Candidate;
}

export function InterviewQnATab({ candidate }: InterviewQnATabProps) {
  // Extract needed values from candidate
  const candidateId = candidate._id;
  const projectId = candidate.projectId;
  const questionnaireId = candidate.interviewDetails?.questionnaireId || "";
  const scheduledDate = candidate.interviewDetails?.scheduledDate;
  const startedAt = candidate.interviewDetails?.startedAt;
  const completedAt = candidate.interviewDetails?.completedAt;
  const interviewDurationMinutes =
    candidate.interviewDetails?.interviewDurationMinutes;
  const interviewerId =
    typeof candidate.assignedInterviewer === "string"
      ? candidate.assignedInterviewer
      : candidate.assignedInterviewer?._id || "";
  const interviewerName =
    typeof candidate.assignedInterviewer === "string"
      ? undefined
      : candidate.assignedInterviewer
      ? `${candidate.assignedInterviewer.firstName} ${candidate.assignedInterviewer.lastName}`
      : undefined;

  // Determine interview status FIRST (needed for hooks)
  const getInterviewStatus = () => {
    if (completedAt) return "COMPLETED";
    if (startedAt) return "IN_PROGRESS";
    if (scheduledDate) return "SCHEDULED";
    return "NOT_STARTED";
  };

  const status = getInterviewStatus();

  const [currentThemeId, setCurrentThemeId] = useState<string>("");
  const [editMode, setEditMode] = useState(false);
  const [editingAnswers, setEditingAnswers] = useState<Record<string, any>>({});

  // Merged data for edit mode (questionnaire questions + submitted answers)
  interface MergedQuestion {
    questionId: string;
    questionText: string;
    questionType: any;
    ratingScale?: any;
    answer?: any;
    answerId?: string | null; // null if no answer exists yet
  }

  interface MergedTheme {
    themeId: string;
    themeName: string;
    themeDescription?: string;
    questions: MergedQuestion[];
    themeNotes?: string;
    themeNotesAnswerId?: string | null;
  }

  const {
    initializeInterview,
    setQuestionAnswer,
    setThemeNotes,
    getQuestionAnswer,
    getThemeNotes,
    clearInterview,
    answers,
    themeNotes,
    startedAt: zustandStartedAt,
  } = useInterviewStore();

  // React Query Hooks
  const shouldFetchQuestionnaire =
    (status === "IN_PROGRESS" || status === "COMPLETED") && !!questionnaireId;

  const { data: questionnaireResponse, isLoading: isLoadingQuestionnaire } =
    useQuestionnaireById(questionnaireId, shouldFetchQuestionnaire);

  const questionnaire = questionnaireResponse?.data || null;

  const {
    data: answersResponse,
    isLoading: isLoadingAnswers,
  } = useAnswersByCandidate(candidateId, undefined, status === "COMPLETED");

  const submittedAnswers =
    answersResponse?.data.themes.flatMap((t) => t.answers) || [];

  const updateInterviewDetailsMutation = useUpdateInterviewDetails();
  const submitInterviewMutation = useSubmitInterviewAnswers();
  const updateAnswerMutation = useUpdateAnswer();
  const submitBulkAnswersMutation = useSubmitBulkAnswers();
  const updateCandidateStatusMutation = useUpdateCandidateStatus();

  const loading = isLoadingQuestionnaire || isLoadingAnswers;
  const submitting =
    updateInterviewDetailsMutation.isPending ||
    submitInterviewMutation.isPending ||
    updateAnswerMutation.isPending ||
    submitBulkAnswersMutation.isPending ||
    updateCandidateStatusMutation.isPending;

  // Set initial theme when questionnaire loads
  if (questionnaire && !currentThemeId && questionnaire.themes.length > 0) {
    setCurrentThemeId(questionnaire.themes[0].themeId);
  }

  // ==================== UTILITY: MERGE QUESTIONNAIRE WITH ANSWERS ====================
  /**
   * Merges the complete questionnaire structure with submitted answers
   * Returns all questions from questionnaire with answer data attached (if exists)
   * This allows editing ALL questions, not just ones that were answered
   */
  const mergeQuestionnaireWithAnswers = (): MergedTheme[] => {
    if (!questionnaire) return [];

    return questionnaire.themes.map((theme) => {
      // Find all answers for this theme (individual answers only, questionId !== null)
      const themeAnswers = submittedAnswers.filter(
        (a) => a.themeId === theme.themeId && a.questionId
      );

      // Find theme-level notes (answer with no questionId)
      const themeNotesAnswer = submittedAnswers.find(
        (a) => a.themeId === theme.themeId && !a.questionId
      );

      // Merge questions with their answers
      const mergedQuestions: MergedQuestion[] = theme.questions.map(
        (question) => {
          // Find existing answer for this question
          const existingAnswer = themeAnswers.find(
            (a) => a.questionId === question.questionId
          );

          return {
            questionId: question.questionId,
            questionText: question.questionText,
            questionType: question.questionType,
            ratingScale: question.ratingScale,
            answer: existingAnswer?.answer || "",
            answerId: existingAnswer?._id || null, // null means no answer exists yet
          };
        }
      );

      return {
        themeId: theme.themeId,
        themeName: theme.themeName,
        themeDescription: theme.themeDescription,
        questions: mergedQuestions,
        themeNotes: themeNotesAnswer?.notes || "",
        themeNotesAnswerId: themeNotesAnswer?._id || null,
      };
    });
  };

  // Start interview
  const handleStartInterview = async () => {
    try {
      const startedAtTime = new Date().toISOString();

      await updateInterviewDetailsMutation.mutateAsync({
        candidateId,
        startedAt: startedAtTime,
      });

      initializeInterview(
        candidateId,
        projectId,
        questionnaireId,
        startedAtTime
      );

      toast.success("Interview started!");
    } catch (error) {
      console.error("Failed to start interview:", error);
      toast.error("Failed to start interview");
    }
  };

  // Handle individual question answer change (NEW v2.0 - NO notes)
  const handleAnswerChange = (
    themeId: string,
    themeName: string,
    questionId: string,
    questionText: string,
    questionType: any,
    answer: any
  ) => {
    setQuestionAnswer(
      themeId,
      themeName,
      questionId,
      questionText,
      questionType,
      answer
    );
  };

  // Handle theme notes change (NEW v2.0 - NO answer, NO questionId)
  const handleThemeNotesChange = (
    themeId: string,
    themeName: string,
    notes: string
  ) => {
    setThemeNotes(themeId, themeName, notes);
  };

  // Calculate theme progress (NEW v2.0 - separate answers and notes)
  const getThemeProgress = (theme: Theme) => {
    const themeAnswers = Object.values(answers).filter(
      (a) => a.themeId === theme.themeId && a.answer !== ""
    );

    const answered = themeAnswers.length;

    const themeNote = getThemeNotes(theme.themeId);
    const hasThemeNotes = themeNote && themeNote.notes !== "";
    const hasQuestionAnswers = answered > 0;

    return {
      answered,
      total: theme.questions.length,
      isComplete: hasThemeNotes || hasQuestionAnswers,
      hasNotes: hasThemeNotes,
    };
  };

  // Validate before submission
  const validateSubmission = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!questionnaire) {
      errors.push("Questionnaire not loaded");
      return { valid: false, errors };
    }

    for (const theme of questionnaire.themes) {
      const progress = getThemeProgress(theme);
      if (!progress.isComplete) {
        errors.push(
          `Theme "${theme.themeName}" is incomplete. Please answer at least one question or add theme notes.`
        );
      }
    }

    return { valid: errors.length === 0, errors };
  };

  // Submit interview (NEW v2.0 - separate individual answers and theme notes)
  const handleSubmitInterview = async () => {
    const validation = validateSubmission();
    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }

    try {
      const completedAtTime = new Date();
      const startTime = new Date(zustandStartedAt || startedAt!);
      const durationMinutes = Math.round(
        (completedAtTime.getTime() - startTime.getTime()) / 60000
      );

      // Prepare individual answers (with questionId, NO notes)
      const individualAnswers: IndividualAnswerInput[] = Object.values(answers)
        .filter((a) => a.answer !== "")
        .map((a) => ({
          themeId: a.themeId,
          themeName: a.themeName,
          questionId: a.questionId, // Required
          questionText: a.questionText, // Required
          questionType: a.questionType, // Required
          answer: a.answer, // Required
          // NO notes field
        }));

      // Prepare theme notes (NO questionId, NO answer)
      const themeNotesArray: ThemeNoteInput[] = Object.values(themeNotes)
        .filter((n) => n.notes !== "")
        .map((n) => ({
          themeId: n.themeId,
          themeName: n.themeName,
          questionId: null, // Must be null
          questionText: null, // Must be null
          questionType: null, // Must be null
          answer: null, // Must be null
          notes: n.notes, // Required
        }));

      // Combine both arrays for submission
      const allAnswers = [...individualAnswers, ...themeNotesArray];

      // Step 1: Submit interview answers
      await submitInterviewMutation.mutateAsync({
        candidateId,
        projectId,
        questionnaireId,
        answers: allAnswers,
        submittedBy: interviewerId,
        completedAt: completedAtTime.toISOString(),
        interviewDurationMinutes: durationMinutes,
      });

      // Step 2: Update overall status to INTERVIEWED
      await updateCandidateStatusMutation.mutateAsync({
        candidateId,
        overallStatus: OverallStatus.INTERVIEWED,
      });

      // React Query automatically invalidates and refetches related queries
      clearInterview();
      toast.success("Interview completed successfully!");
    } catch (error: any) {
      console.error("Failed to submit interview:", error);
      const errorMsg =
        error?.response?.data?.error || "Failed to submit interview";
      toast.error(errorMsg);
    }
  };

  // Handle edit answer change in edit mode
  const handleEditAnswerChange = (key: string, value: any) => {
    setEditingAnswers((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Save edited answers (NEW v2.0 - handle individual answers and theme notes separately)
  const handleSaveEdits = async () => {
    try {
      const mergedData = mergeQuestionnaireWithAnswers();

      // Prepare individual answers (with questionId, NO notes)
      const individualAnswersToSubmit: IndividualAnswerInput[] = [];

      mergedData.forEach((theme) => {
        // Process each question
        theme.questions.forEach((question) => {
          const key = `${theme.themeId}_${question.questionId}`;
          const editedValue = editingAnswers[key];

          // Use edited value if exists, otherwise use original value
          const finalAnswer =
            editedValue !== undefined ? editedValue : question.answer;

          // Only include if answer is filled
          if (finalAnswer !== "") {
            individualAnswersToSubmit.push({
              themeId: theme.themeId,
              themeName: theme.themeName,
              questionId: question.questionId, // Required
              questionText: question.questionText, // Required
              questionType: question.questionType, // Required
              answer: finalAnswer, // Required
              // NO notes field
            });
          }
        });
      });

      // Submit individual answers using bulk endpoint
      if (individualAnswersToSubmit.length > 0) {
        await submitBulkAnswersMutation.mutateAsync({
          candidateId,
          projectId,
          questionnaireId,
          answers: individualAnswersToSubmit,
          submittedBy: interviewerId,
        });
      }

      // Handle theme notes separately using updateAnswer mutation
      const themeNotesPromises: Promise<any>[] = [];
      mergedData.forEach((theme) => {
        const themeNotesKey = `${theme.themeId}_notes`;
        const editedThemeNotes = editingAnswers[themeNotesKey];

        // Only update if theme notes were edited
        if (editedThemeNotes !== undefined && theme.themeNotesAnswerId) {
          themeNotesPromises.push(
            updateAnswerMutation.mutateAsync({
              id: theme.themeNotesAnswerId,
              notes: editedThemeNotes,
            })
          );
        }
      });

      // Update all theme notes in parallel
      if (themeNotesPromises.length > 0) {
        await Promise.all(themeNotesPromises);
      }

      toast.success("Answers updated successfully!");

      // Exit edit mode and clear state
      setEditMode(false);
      setEditingAnswers({});

      // React Query will automatically refetch due to cache invalidation from mutations
    } catch (error: any) {
      console.error("Failed to update answers:", error);
      const errorMsg = error?.response?.data?.error || "Failed to update answers";
      toast.error(errorMsg);
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditMode(false);
    setEditingAnswers({});
  };

  // STATE 1: NOT_STARTED
  if (status === "NOT_STARTED") {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No Interview Scheduled</h3>
        <p className="text-muted-foreground mt-2">
          Please schedule an interview from the Follow-ups & Interview tab
          first.
          <br />
          Add a follow-up with &quot;Answered - Agreed&quot; status to schedule
          the interview.
        </p>
      </div>
    );
  }

  // STATE 2: SCHEDULED
  if (status === "SCHEDULED") {
    return (
      <div className="rounded-lg border p-12 text-center space-y-6">
        <div>
          <Calendar className="mx-auto h-12 w-12 text-blue-500" />
          <h3 className="mt-4 text-xl font-semibold">Interview Scheduled</h3>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {scheduledDate &&
                format(new Date(scheduledDate), "MMMM dd, yyyy 'at' hh:mm a")}
            </span>
          </div>
        </div>

        <div>
          <p className="text-muted-foreground mb-6">
            Ready to start the interview?
          </p>
          <Button onClick={handleStartInterview} disabled={loading} size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <PlayCircle className="mr-2 h-4 w-4" />
                Start Interview
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading || !questionnaire) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // STATE 4: COMPLETED
  if (status === "COMPLETED") {
    // Get merged data (all questions + answers) for edit mode
    const mergedData = editMode ? mergeQuestionnaireWithAnswers() : [];

    return (
      <div className="space-y-6">
        {/* Completion Summary */}
        <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                    Interview Completed Successfully
                  </h3>
                  <div className="mt-2 space-y-1 text-sm text-green-700 dark:text-green-300">
                    <p>
                      <strong>Completed by:</strong>{" "}
                      {interviewerName || "Interviewer"}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {completedAt &&
                        format(
                          new Date(completedAt),
                          "MMMM dd, yyyy 'at' hh:mm a"
                        )}
                    </p>
                    <p>
                      <strong>Duration:</strong> {interviewDurationMinutes || 0}{" "}
                      minutes
                    </p>
                    <p>
                      <strong>Total Answers:</strong> {submittedAnswers.length}{" "}
                      responses
                    </p>
                  </div>
                </div>
              </div>

              {!editMode ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditMode(true)}
                  className="border-green-300 dark:border-green-700"
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Answers
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={submitting}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveEdits}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submitted Answers */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            {editMode ? "Edit Interview Answers" : "Submitted Answers"}
            {editMode && <Badge variant="secondary">Edit Mode</Badge>}
          </h3>

          <Tabs
            value={currentThemeId}
            onValueChange={setCurrentThemeId}
            orientation="vertical"
            className="w-full flex-row"
          >
            <TabsList className="flex-col h-fit">
              {questionnaire.themes.map((theme) => {
                const themeAnswers = submittedAnswers.filter(
                  (a) => a.themeId === theme.themeId
                );
                return (
                  <TabsTrigger
                    key={theme.themeId}
                    value={theme.themeId}
                    className="w-full justify-start gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="flex-1 text-left">{theme.themeName}</span>
                    <span className="text-xs text-muted-foreground">
                      {editMode ? theme.questions.length : themeAnswers.length}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <div className="grow rounded-md border">
              {editMode ? (
                // EDIT MODE - Show ALL questions from questionnaire
                mergedData.map((theme) => (
                  <TabsContent
                    key={theme.themeId}
                    value={theme.themeId}
                    className="p-6 space-y-8"
                  >
                    <div>
                      <h3 className="text-xl font-semibold">
                        {theme.themeName}
                      </h3>
                      {theme.themeDescription && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {theme.themeDescription}
                        </p>
                      )}
                    </div>

                    {/* Render ALL questions */}
                    {theme.questions.map((question, idx) => {
                      const key = `${theme.themeId}_${question.questionId}`;
                      const currentValue =
                        editingAnswers[key] !== undefined
                          ? editingAnswers[key]
                          : question.answer;

                      return (
                        <div
                          key={question.questionId}
                          className="pb-6 border-b last:border-0"
                        >
                          <div className="mb-2 text-sm text-muted-foreground">
                            Question {idx + 1} of {theme.questions.length}
                          </div>
                          <QuestionRenderer
                            questionId={question.questionId}
                            questionText={question.questionText}
                            questionType={question.questionType}
                            ratingScale={question.ratingScale || undefined}
                            value={currentValue || ""}
                            onChange={(value) =>
                              handleEditAnswerChange(key, value)
                            }
                          />
                        </div>
                      );
                    })}

                    {/* Theme-level notes */}
                    <div className="pt-4 border-t">
                      <Label
                        htmlFor={`theme-notes-${theme.themeId}`}
                        className="text-sm font-medium"
                      >
                        General Theme Notes
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1 mb-2">
                        Add general notes about this theme instead of
                        answering individual questions
                      </p>
                      <Textarea
                        id={`theme-notes-${theme.themeId}`}
                        value={
                          editingAnswers[`${theme.themeId}_notes`] !==
                          undefined
                            ? editingAnswers[`${theme.themeId}_notes`]
                            : theme.themeNotes || ""
                        }
                        onChange={(e) =>
                          handleEditAnswerChange(
                            `${theme.themeId}_notes`,
                            e.target.value
                          )
                        }
                        placeholder="Type general notes about this theme..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </TabsContent>
                ))
              ) : (
                // READ-ONLY MODE - Show only submitted answers
                questionnaire.themes.map((theme) => {
                  const themeAnswers = submittedAnswers.filter(
                    (a) => a.themeId === theme.themeId
                  );

                  return (
                    <TabsContent
                      key={theme.themeId}
                      value={theme.themeId}
                      className="p-6 space-y-6"
                    >
                      <div>
                        <h3 className="text-xl font-semibold">
                          {theme.themeName}
                        </h3>
                        {theme.themeDescription && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {theme.themeDescription}
                          </p>
                        )}
                      </div>

                      {themeAnswers.map((answer, idx) => {
                        // NEW v2.0: Separate individual answers (questionId exists) from theme notes (no questionId)
                        const isThemeNote = !answer.questionId;

                        return (
                          <div
                            key={answer._id}
                            className="pb-6 border-b last:border-0"
                          >
                            <div className="mb-2 text-sm text-muted-foreground">
                              {isThemeNote ? "Theme Notes" : `Question ${idx + 1}`}
                            </div>

                            <div>
                              {!isThemeNote && (
                                <h4 className="text-base font-medium mb-3">
                                  {answer.questionText}
                                </h4>
                              )}
                              <div className="p-4 rounded-lg bg-muted/30">
                                <p className="text-sm whitespace-pre-wrap">
                                  {isThemeNote
                                    ? answer.notes || (
                                        <em className="text-muted-foreground">
                                          No notes provided
                                        </em>
                                      )
                                    : answer.answer || (
                                        <em className="text-muted-foreground">
                                          No answer provided
                                        </em>
                                      )}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </TabsContent>
                  );
                })
              )}
            </div>
          </Tabs>
        </div>
      </div>
    );
  }

  // STATE 3: IN_PROGRESS
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold">{questionnaire.name}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {questionnaire.themes.length} themes •{" "}
            {questionnaire.themes.reduce(
              (acc, t) => acc + t.questions.length,
              0
            )}{" "}
            questions
          </p>
        </div>
        <Button onClick={handleSubmitInterview} disabled={submitting} size="lg">
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Complete Interview
            </>
          )}
        </Button>
      </div>

      <Tabs
        value={currentThemeId}
        onValueChange={setCurrentThemeId}
        orientation="vertical"
        className="w-full flex-row"
      >
        <TabsList className="flex-col h-fit">
          {questionnaire.themes.map((theme) => {
            const progress = getThemeProgress(theme);
            return (
              <TabsTrigger
                key={theme.themeId}
                value={theme.themeId}
                className="w-full justify-start gap-2"
              >
                {progress.isComplete ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="flex-1 text-left">{theme.themeName}</span>
                <span className="text-xs text-muted-foreground">
                  {progress.answered}/{progress.total}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="grow rounded-md border">
          {questionnaire.themes.map((theme) => (
            <TabsContent
              key={theme.themeId}
              value={theme.themeId}
              className="p-6 space-y-8"
            >
              <div>
                <h3 className="text-xl font-semibold">{theme.themeName}</h3>
                {theme.themeDescription && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {theme.themeDescription}
                  </p>
                )}
              </div>

              {theme.questions.map((question, idx) => {
                const savedAnswer = getQuestionAnswer(
                  theme.themeId,
                  question.questionId
                );
                return (
                  <div
                    key={question.questionId}
                    className="pb-6 border-b last:border-0"
                  >
                    <div className="mb-2 text-sm text-muted-foreground">
                      Question {idx + 1} of {theme.questions.length}
                    </div>
                    <QuestionRenderer
                      questionId={question.questionId}
                      questionText={question.questionText}
                      questionType={question.questionType}
                      ratingScale={question.ratingScale || undefined}
                      value={savedAnswer?.answer || ""}
                      onChange={(answer) =>
                        handleAnswerChange(
                          theme.themeId,
                          theme.themeName,
                          question.questionId,
                          question.questionText,
                          question.questionType,
                          answer
                        )
                      }
                    />
                  </div>
                );
              })}

              <div className="pt-4 border-t">
                <Label
                  htmlFor={`theme-notes-${theme.themeId}`}
                  className="text-sm font-medium"
                >
                  General Theme Notes
                </Label>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  Add general notes about this theme instead of answering
                  individual questions
                </p>
                <Textarea
                  id={`theme-notes-${theme.themeId}`}
                  value={getThemeNotes(theme.themeId)?.notes || ""}
                  onChange={(e) =>
                    handleThemeNotesChange(
                      theme.themeId,
                      theme.themeName,
                      e.target.value
                    )
                  }
                  placeholder="Type general notes about this theme..."
                  className="min-h-[100px]"
                />
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
