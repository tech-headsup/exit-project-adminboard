import * as z from "zod";
import { ProjectType } from "@/types/projectTypes";

// Step 1: Basic Project Details
export const projectBasicDetailsSchema = z.object({
  companyId: z.string().min(1, "Please select a company"),
  projectName: z.string().min(1, "Project name is required"),
  projectType: z.nativeEnum(ProjectType, {
    message: "Please select a project type",
  }),
  noOfEmployees: z
    .number()
    .min(1, "Number of employees must be at least 1")
    .max(10000, "Number of employees cannot exceed 10,000"),
});

// Step 2: Questionnaire Selection
export const questionnaireSelectionSchema = z.object({
  questionnaireId: z.string().min(1, "Please select a questionnaire"),
});

// Step 3: Heads-Up SPOC Selection
export const headsUpSpocSchema = z.object({
  headsUpSpocIds: z
    .array(z.string())
    .min(1, "Please select at least one Heads-Up SPOC"),
});

// Step 4: Client SPOC Selection
export const clientSpocSchema = z.object({
  clientSpocIds: z.array(z.string()).optional(),
});

// Step 5: Interviewer Selection
export const interviewerSchema = z.object({
  interviewerIds: z
    .array(z.string())
    .min(1, "Please select at least one interviewer"),
});

export type ProjectBasicDetailsValues = z.infer<
  typeof projectBasicDetailsSchema
>;
export type QuestionnaireSelectionValues = z.infer<
  typeof questionnaireSelectionSchema
>;
export type HeadsUpSpocValues = z.infer<typeof headsUpSpocSchema>;
export type ClientSpocValues = z.infer<typeof clientSpocSchema>;
export type InterviewerValues = z.infer<typeof interviewerSchema>;

// Step labels for the stepper
export const projectFormSteps = [1, 2, 3, 4, 5, 6, 7, 8] as const;

export const projectStepLabels = [
  "Project Details",
  "Questionnaire",
  "Heads-Up SPOC",
  "Client SPOC",
  "Interviewers",
  "Upload Candidates",
  "Assign Interviewers",
  "Review & Launch",
];
