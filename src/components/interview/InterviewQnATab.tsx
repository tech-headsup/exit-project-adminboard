"use client";

import { useState, useEffect } from "react";
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
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useInterviewStore } from "@/stores/interviewStore";
import { candidateService } from "@/api/services/candidateService";
import { questionnaireService } from "@/api/services/questionnaireService";
import { answerService } from "@/api/services/answerService";
import { QuestionRenderer } from "./QuestionRenderer";
import { Questionnaire, Theme } from "@/types/questionnaireTypes";
import { AnswerInput, Answer } from "@/types/answerTypes";

interface InterviewQnATabProps {
  candidateId: string;
  projectId: string;
  questionnaireId: string;
  scheduledDate?: Date | string;
  startedAt?: Date | string;
  completedAt?: Date | string;
  interviewDurationMinutes?: number;
  answersSubmitted?: boolean;
  interviewerId: string;
  interviewerName?: string;
  onInterviewComplete: () => void;
}

export function InterviewQnATab({
  candidateId,
  projectId,
  questionnaireId,
  scheduledDate,
  startedAt,
  completedAt,
  interviewDurationMinutes,
  answersSubmitted,
  interviewerId,
  interviewerName,
  onInterviewComplete,
}: InterviewQnATabProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [currentThemeId, setCurrentThemeId] = useState<string>("");
  const [submittedAnswers, setSubmittedAnswers] = useState<Answer[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [editingAnswers, setEditingAnswers] = useState<Record<string, any>>({});

  const {
    initializeInterview,
    setAnswer,
    getAnswer,
    clearInterview,
    answers,
    startedAt: zustandStartedAt,
  } = useInterviewStore();

  // Determine interview status
  const getInterviewStatus = () => {
    if (completedAt) return "COMPLETED";
    if (startedAt) return "IN_PROGRESS";
    if (scheduledDate) return "SCHEDULED";
    return "NOT_STARTED";
  };

  const status = getInterviewStatus();

  // Load questionnaire when needed
  useEffect(() => {
    const loadQuestionnaire = async () => {
      if (!questionnaireId) return;

      try {
        setLoading(true);
        const response = await questionnaireService.getQuestionnaire({
          id: questionnaireId,
        });
        setQuestionnaire(response.data);

        if (response.data.themes.length > 0) {
          setCurrentThemeId(response.data.themes[0].themeId);
        }
      } catch (error) {
        console.error("Failed to load questionnaire:", error);
        toast.error("Failed to load questionnaire");
      } finally {
        setLoading(false);
      }
    };

    if (status === "IN_PROGRESS" || status === "COMPLETED") {
      loadQuestionnaire();
    }
  }, [questionnaireId, status]);

  // Load submitted answers if completed
  useEffect(() => {
    const loadSubmittedAnswers = async () => {
      if (status !== "COMPLETED") return;

      try {
        setLoading(true);
        const response = await answerService.getAnswersByCandidate({
          candidateId,
        });
        setSubmittedAnswers(response.data.themes.flatMap(t => t.answers));
      } catch (error) {
        console.error("Failed to load answers:", error);
      } finally {
        setLoading(false);
      }
    };

    if (status === "COMPLETED") {
      loadSubmittedAnswers();
    }
  }, [status, candidateId]);

  // Start interview
  const handleStartInterview = async () => {
    try {
      setLoading(true);

      const startedAtTime = new Date().toISOString();
      await candidateService.updateInterviewDetails({
        candidateId,
        startedAt: startedAtTime,
      });

      initializeInterview(candidateId, projectId, questionnaireId, startedAtTime);

      toast.success("Interview started!");
      onInterviewComplete();
    } catch (error) {
      console.error("Failed to start interview:", error);
      toast.error("Failed to start interview");
    } finally {
      setLoading(false);
    }
  };

  // Handle answer change
  const handleAnswerChange = (
    themeId: string,
    themeName: string,
    questionId: string | null,
    questionText: string,
    questionType: any,
    answer: any
  ) => {
    setAnswer(themeId, themeName, questionId, questionText, questionType, answer, "");
  };

  // Handle theme notes change
  const handleThemeNotesChange = (
    themeId: string,
    themeName: string,
    notes: string
  ) => {
    setAnswer(themeId, themeName, null, "", "", "", notes);
  };

  // Calculate theme progress
  const getThemeProgress = (theme: Theme) => {
    const themeAnswers = Object.values(answers).filter(
      (a) => a.themeId === theme.themeId && a.questionId !== null
    );

    const answered = themeAnswers.filter((a) => a.answer !== "").length;

    const themeNotes = getAnswer(theme.themeId, null);
    const hasThemeNotes = themeNotes && themeNotes.notes !== "";
    const hasQuestionAnswers = themeAnswers.some((a) => a.answer !== "");

    return {
      answered,
      total: theme.questions.length,
      isComplete: hasThemeNotes || hasQuestionAnswers,
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

  // Submit interview
  const handleSubmitInterview = async () => {
    const validation = validateSubmission();
    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }

    try {
      setSubmitting(true);

      const completedAtTime = new Date();
      const startTime = new Date(zustandStartedAt || startedAt!);
      const durationMinutes = Math.round(
        (completedAtTime.getTime() - startTime.getTime()) / 60000
      );

      const answersArray: AnswerInput[] = Object.values(answers)
        .filter((a) => a.answer !== "" || a.notes !== "")
        .map((a) => ({
          themeId: a.themeId,
          themeName: a.themeName,
          questionId: a.questionId || undefined,
          questionText: a.questionText || undefined,
          questionType: a.questionType || undefined,
          answer: a.answer !== "" ? a.answer : undefined,
          notes: a.notes !== "" ? a.notes : undefined,
        }));

      await answerService.submitInterviewAnswers({
        candidateId,
        projectId,
        questionnaireId,
        answers: answersArray,
        submittedBy: interviewerId,
        completedAt: completedAtTime.toISOString(),
        interviewDurationMinutes: durationMinutes,
      });

      // Update overall status to INTERVIEWED (backend should handle this, but we'll ensure it)
      // The backend pre-save hook should automatically set overallStatus to INTERVIEWED
      // when answersSubmitted is true

      clearInterview();
      toast.success("Interview completed successfully!");
      onInterviewComplete();
    } catch (error: any) {
      console.error("Failed to submit interview:", error);
      const errorMsg = error?.response?.data?.error || "Failed to submit interview";
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit answer
  const handleEditAnswer = (answerId: string, newValue: any) => {
    setEditingAnswers(prev => ({
      ...prev,
      [answerId]: newValue
    }));
  };

  // Save edited answers
  const handleSaveEdits = async () => {
    try {
      setSubmitting(true);

      for (const [answerId, value] of Object.entries(editingAnswers)) {
        await answerService.updateAnswer({
          id: answerId,
          answer: value,
        });
      }

      toast.success("Answers updated successfully!");
      setEditMode(false);
      setEditingAnswers({});

      const response = await answerService.getAnswersByCandidate({
        candidateId,
      });
      setSubmittedAnswers(response.data.themes.flatMap(t => t.answers));
    } catch (error) {
      console.error("Failed to update answers:", error);
      toast.error("Failed to update answers");
    } finally {
      setSubmitting(false);
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
          Please schedule an interview from the Follow-ups & Interview tab first.
          <br />
          Add a follow-up with &quot;Answered - Agreed&quot; status to schedule the interview.
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
              {scheduledDate && format(new Date(scheduledDate), "MMMM dd, yyyy 'at' hh:mm a")}
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
                      <strong>Completed by:</strong> {interviewerName || "Interviewer"}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {completedAt && format(new Date(completedAt), "MMMM dd, yyyy 'at' hh:mm a")}
                    </p>
                    <p>
                      <strong>Duration:</strong> {interviewDurationMinutes || 0} minutes
                    </p>
                    <p>
                      <strong>Total Answers:</strong> {submittedAnswers.length} responses
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
            Submitted Answers
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
                      {themeAnswers.length}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <div className="grow rounded-md border">
              {questionnaire.themes.map((theme) => {
                const themeAnswers = submittedAnswers.filter(
                  (a) => a.themeId === theme.themeId
                );

                return (
                  <TabsContent key={theme.themeId} value={theme.themeId} className="p-6 space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold">{theme.themeName}</h3>
                      {theme.themeDescription && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {theme.themeDescription}
                        </p>
                      )}
                    </div>

                    {themeAnswers.map((answer, idx) => {
                      // Find the corresponding question from the questionnaire
                      const question = theme.questions.find(q => q.questionId === answer.questionId);
                      const isThemeNotes = !answer.questionText;

                      return (
                        <div key={answer._id} className="pb-6 border-b last:border-0">
                          <div className="mb-2 text-sm text-muted-foreground">
                            {answer.questionText ? `Question ${idx + 1}` : "Theme Notes"}
                          </div>

                          {editMode ? (
                            // Edit Mode - Use QuestionRenderer for proper input types
                            isThemeNotes ? (
                              // Theme notes editing
                              <div>
                                <Label className="text-sm font-medium">General Theme Notes</Label>
                                <Textarea
                                  value={editingAnswers[answer._id] ?? (answer.notes || "")}
                                  onChange={(e) => handleEditAnswer(answer._id, e.target.value)}
                                  className="mt-2 min-h-[100px]"
                                  placeholder="Type general notes about this theme..."
                                />
                              </div>
                            ) : question ? (
                              // Question editing with proper renderer
                              <QuestionRenderer
                                questionId={answer._id}
                                questionText={answer.questionText || ""}
                                questionType={answer.questionType!}
                                ratingScale={question.ratingScale || undefined}
                                value={editingAnswers[answer._id] ?? (answer.answer || "")}
                                onChange={(value) => handleEditAnswer(answer._id, value)}
                              />
                            ) : (
                              // Fallback to textarea if question not found
                              <Textarea
                                value={editingAnswers[answer._id] ?? (answer.answer || answer.notes || "")}
                                onChange={(e) => handleEditAnswer(answer._id, e.target.value)}
                                className="min-h-[100px]"
                              />
                            )
                          ) : (
                            // Read-only Mode
                            <div>
                              {answer.questionText && (
                                <h4 className="text-base font-medium mb-3">{answer.questionText}</h4>
                              )}
                              <div className="p-4 rounded-lg bg-muted/30">
                                <p className="text-sm whitespace-pre-wrap">
                                  {answer.answer || answer.notes || <em className="text-muted-foreground">No answer provided</em>}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </TabsContent>
                );
              })}
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
            {questionnaire.themes.reduce((acc, t) => acc + t.questions.length, 0)}{" "}
            questions
          </p>
        </div>
        <Button
          onClick={handleSubmitInterview}
          disabled={submitting}
          size="lg"
        >
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
            <TabsContent key={theme.themeId} value={theme.themeId} className="p-6 space-y-8">
              <div>
                <h3 className="text-xl font-semibold">{theme.themeName}</h3>
                {theme.themeDescription && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {theme.themeDescription}
                  </p>
                )}
              </div>

              {theme.questions.map((question, idx) => {
                const savedAnswer = getAnswer(theme.themeId, question.questionId);
                return (
                  <div key={question.questionId} className="pb-6 border-b last:border-0">
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
                <Label htmlFor={`theme-notes-${theme.themeId}`} className="text-sm font-medium">
                  General Theme Notes
                </Label>
                <p className="text-xs text-muted-foreground mt-1 mb-2">
                  Add general notes about this theme instead of answering individual questions
                </p>
                <Textarea
                  id={`theme-notes-${theme.themeId}`}
                  value={getAnswer(theme.themeId, null)?.notes || ""}
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
