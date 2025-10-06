import * as z from "zod";
import { ProjectType } from "@/types/projectTypes";

// ==================== NEW 5-STEP SCHEMAS ====================

// Step 1: Project Setup (Combined: Basic Details + Questionnaire)
export const projectSetupSchema = z.object({
  companyId: z.string().min(1, "Please select a company"),
  projectName: z.string().min(1, "Project name is required"),
  projectType: z.nativeEnum(ProjectType, {
    message: "Please select a project type",
  }),
  noOfEmployees: z
    .number()
    .min(1, "Number of employees must be at least 1")
    .max(10000, "Number of employees cannot exceed 10,000"),
  questionnaireId: z.string().min(1, "Please select a questionnaire"),
});

// Step 2: Team Assignment (Combined: Heads-Up SPOC + Client SPOC + Interviewers)
export const teamAssignmentSchema = z.object({
  headsUpSpocIds: z
    .array(z.string())
    .min(1, "Please select at least one Heads-Up SPOC"),
  clientSpocIds: z.array(z.string()).optional(),
  interviewerIds: z
    .array(z.string())
    .min(1, "Please select at least one interviewer"),
});

// Step 3: Candidate Upload (No schema - handled by upload component)
// Step 4: Interviewer Assignment (No schema - handled by assignment component)
// Step 5: Review & Launch (No schema - readiness check)

export type ProjectSetupValues = z.infer<typeof projectSetupSchema>;
export type TeamAssignmentValues = z.infer<typeof teamAssignmentSchema>;

// Step labels for the stepper
export const projectFormSteps = [1, 2, 3, 4, 5] as const;

export const projectStepLabels = [
  "Project Setup",
  "Team Assignment",
  "Upload Candidates",
  "Assign Interviewers",
  "Review & Launch",
];
