import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";

// Hooks
import {
  useCreateProject,
  useUpdateProject,
  useUpdateProjectStatus,
  useProjectById,
} from "@/hooks/useProject";
import {
  useUploadCandidates,
  useAssignInterviewer,
  useAutoAssignInterviewers,
} from "@/hooks/useCandidate";
import { useAuthContext } from "@/contexts/AuthContext";

// Types
import { ProjectStatus } from "@/types/projectTypes";
import { CandidateRow, convertToExcelCandidateRow } from "@/lib/candidate-upload-schema";

// Schemas
import {
  projectBasicDetailsSchema,
  questionnaireSelectionSchema,
  headsUpSpocSchema,
  clientSpocSchema,
  interviewerSchema,
  projectFormSteps,
  projectStepLabels,
  ProjectBasicDetailsValues,
  QuestionnaireSelectionValues,
  HeadsUpSpocValues,
  ClientSpocValues,
  InterviewerValues,
} from "@/lib/project-form-schema";

// Components
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProjectFormSteps } from "@/components/project/ProjectFormSteps";
import { ProjectBasicDetailsFields } from "@/components/project/ProjectBasicDetailsFields";
import { QuestionnaireSelector } from "@/components/project/QuestionnaireSelector";
import { UserMultiSelect } from "@/components/project/UserMultiSelect";
import { CandidateUploadTable } from "@/components/project/CandidateUploadTable";
import { InterviewerAssignment } from "@/components/project/InterviewerAssignment";
import { ReadinessChecklist } from "@/components/project/ReadinessChecklist";
import { UserRole } from "@/types/userTypes";

export default function CreateProject() {
  const router = useRouter();
  const { user } = useAuthContext();

  // Query params state with nuqs
  const [currentStep, setCurrentStep] = useQueryState(
    "step",
    parseAsInteger.withDefault(1)
  );
  const [projectId, setProjectId] = useQueryState(
    "projectId",
    parseAsString.withDefault("")
  );

  // Local state management
  const [noOfEmployees, setNoOfEmployees] = useState<number>(0);
  const [showReadinessDialog, setShowReadinessDialog] = useState(false);

  // Fetch project data (only when projectId exists)
  const { data: projectData } = useProjectById(projectId || "", !!projectId);

  // Mutations
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const uploadCandidates = useUploadCandidates();
  const assignInterviewer = useAssignInterviewer();
  const autoAssignInterviewers = useAutoAssignInterviewers();
  const updateProjectStatus = useUpdateProjectStatus();

  // Forms for each step
  const step1Form = useForm<ProjectBasicDetailsValues>({
    resolver: zodResolver(projectBasicDetailsSchema),
    defaultValues: {
      companyId: "",
      projectName: "",
      projectType: undefined,
      noOfEmployees: 0,
    },
  });

  const step2Form = useForm<QuestionnaireSelectionValues>({
    resolver: zodResolver(questionnaireSelectionSchema),
    defaultValues: {
      questionnaireId: "",
    },
  });

  const step3Form = useForm<HeadsUpSpocValues>({
    resolver: zodResolver(headsUpSpocSchema),
    defaultValues: {
      headsUpSpocIds: [],
    },
  });

  const step4Form = useForm<ClientSpocValues>({
    resolver: zodResolver(clientSpocSchema),
    defaultValues: {
      clientSpocIds: [],
    },
  });

  const step5Form = useForm<InterviewerValues>({
    resolver: zodResolver(interviewerSchema),
    defaultValues: {
      interviewerIds: [],
    },
  });

  // Step 1: Create Project
  const handleStep1Submit = async (data: ProjectBasicDetailsValues) => {
    try {
      const response = await createProject.mutateAsync(data);
      setNoOfEmployees(data.noOfEmployees);
      toast.success("Project created successfully!");
      // Update both step and projectId in URL
      await setProjectId(response.data._id);
      await setCurrentStep(2);
    } catch (error) {
      toast.error("Failed to create project", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Step 2: Assign Questionnaire
  const handleStep2Submit = async (data: QuestionnaireSelectionValues) => {
    if (!projectId) {
      toast.error("Project ID not found");
      return;
    }

    try {
      await updateProject.mutateAsync({
        id: projectId,
        questionnaireId: data.questionnaireId,
      });
      toast.success("Questionnaire assigned successfully!");
      setCurrentStep(3);
    } catch (error) {
      toast.error("Failed to assign questionnaire", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Step 3: Assign Heads-Up SPOC
  const handleStep3Submit = async (data: HeadsUpSpocValues) => {
    if (!projectId) {
      toast.error("Project ID not found");
      return;
    }

    try {
      await updateProject.mutateAsync({
        id: projectId,
        headsUpSpocIds: data.headsUpSpocIds,
      });
      toast.success("Heads-Up SPOC assigned successfully!");
      setCurrentStep(4);
    } catch (error) {
      toast.error("Failed to assign Heads-Up SPOC", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Step 4: Assign Client SPOC
  const handleStep4Submit = async (data: ClientSpocValues) => {
    if (!projectId) {
      toast.error("Project ID not found");
      return;
    }

    try {
      await updateProject.mutateAsync({
        id: projectId,
        clientSpocIds: data.clientSpocIds,
      });
      toast.success("Client SPOC assigned successfully!");
      setCurrentStep(5);
    } catch (error) {
      toast.error("Failed to assign Client SPOC", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Step 5: Assign Interviewers to Project
  const handleStep5Submit = async (data: InterviewerValues) => {
    if (!projectId) {
      toast.error("Project ID not found");
      return;
    }

    try {
      await updateProject.mutateAsync({
        id: projectId,
        interviewerIds: data.interviewerIds,
      });
      toast.success("Interviewers assigned to project successfully!");
      setCurrentStep(6);
    } catch (error) {
      toast.error("Failed to assign interviewers", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Step 6: Upload Candidates
  const handleCandidateUpload = async (candidates: CandidateRow[]) => {
    if (!projectId || !user) {
      toast.error("Project ID or User not found");
      return;
    }

    try {
      // Convert CandidateRow[] to ExcelCandidateRow[] format
      const excelCandidates = candidates.map(convertToExcelCandidateRow);

      await uploadCandidates.mutateAsync({
        projectId,
        uploadedBy: user._id,
        candidates: excelCandidates,
      });
      toast.success(`${candidates.length} candidates uploaded successfully!`);
      setCurrentStep(7);
    } catch (error) {
      toast.error("Failed to upload candidates", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Step 7: Assign Interviewers to Candidates (Manual)
  const handleManualAssign = async (
    candidateIds: string[],
    interviewerId: string
  ) => {
    if (!user) {
      toast.error("User not found");
      return;
    }

    try {
      await assignInterviewer.mutateAsync({
        candidateIds,
        interviewerId,
        assignedBy: user._id,
      });
      toast.success(
        `Assigned ${candidateIds.length} candidate(s) successfully!`
      );
    } catch (error) {
      toast.error("Failed to assign interviewer", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Step 7: Auto-Assign Interviewers to Candidates
  const handleAutoAssign = async () => {
    if (!projectId || !user) {
      toast.error("Project ID or User not found");
      return;
    }

    if (!projectData?.data) {
      toast.error("Project data not loaded yet. Please wait.");
      return;
    }

    // Get interviewerIds from project data - handle both string[] and PopulatedUser[]
    const rawInterviewerIds = projectData.data.interviewerIds || [];
    const interviewerIds = rawInterviewerIds.map((id) =>
      typeof id === "string" ? id : id._id
    );

    if (interviewerIds.length === 0) {
      toast.error("No interviewers assigned to this project");
      return;
    }

    try {
      const response = await autoAssignInterviewers.mutateAsync({
        projectId,
        interviewerIds,
        assignedBy: user._id,
      });
      toast.success(
        `Auto-assigned ${response.data.totalCandidates} candidates to ${response.data.distribution.length} interviewers!`
      );
      setCurrentStep(8);
    } catch (error) {
      toast.error("Failed to auto-assign interviewers", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Step 8: Start Project
  const handleStartProject = async () => {
    if (!projectId) {
      toast.error("Project ID not found");
      return;
    }

    try {
      await updateProjectStatus.mutateAsync({
        id: projectId,
        projectStatus: ProjectStatus.IN_PROGRESS,
      });
      toast.success("Project started successfully!");
      router.push("/projects");
    } catch (error) {
      toast.error("Failed to start project", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      step1Form.handleSubmit(handleStep1Submit)();
    } else if (currentStep === 2) {
      step2Form.handleSubmit(handleStep2Submit)();
    } else if (currentStep === 3) {
      step3Form.handleSubmit(handleStep3Submit)();
    } else if (currentStep === 4) {
      step4Form.handleSubmit(handleStep4Submit)();
    } else if (currentStep === 5) {
      step5Form.handleSubmit(handleStep5Submit)();
    } else if (currentStep === 6) {
      toast.info("Please upload candidates to continue");
    } else if (currentStep === 7) {
      setCurrentStep(8);
    } else if (currentStep === 8) {
      setShowReadinessDialog(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isLoading =
    createProject.isPending ||
    updateProject.isPending ||
    uploadCandidates.isPending ||
    assignInterviewer.isPending ||
    autoAssignInterviewers.isPending ||
    updateProjectStatus.isPending;

  return (
    <ErrorBoundary
      onReset={() => {
        // Reset to step 1 on error
        setCurrentStep(1);
      }}
    >
      <div className="mx-auto max-w-6xl space-y-8 p-6">
        <h1 className="text-2xl font-bold">Create New Project</h1>

        <ProjectFormSteps
        steps={projectFormSteps}
        currentStep={currentStep}
        stepLabels={projectStepLabels}
      />

      <div className="min-h-[400px]">
        {/* Step 1: Project Basic Details */}
        {currentStep === 1 && (
          <Form {...step1Form}>
            <form className="space-y-6">
              <ProjectBasicDetailsFields control={step1Form.control} />
            </form>
          </Form>
        )}

        {/* Step 2: Questionnaire Selection */}
        {currentStep === 2 && (
          <Form {...step2Form}>
            <form className="space-y-6">
              <QuestionnaireSelector control={step2Form.control} />
            </form>
          </Form>
        )}

        {/* Step 3: Heads-Up SPOC */}
        {currentStep === 3 && (
          <Form {...step3Form}>
            <form className="space-y-6">
              <UserMultiSelect
                control={step3Form.control}
                name="headsUpSpocIds"
                label="Heads-Up SPOC"
                title="Assign Heads-Up SPOC"
                cardDescription="Select admin or executive users who will be notified about project updates"
                roleFilter="NON_CLIENT"
                description="Select one or more users to receive project notifications"
              />
            </form>
          </Form>
        )}

        {/* Step 4: Client SPOC */}
        {currentStep === 4 && (
          <Form {...step4Form}>
            <form className="space-y-6">
              <UserMultiSelect
                control={step4Form.control}
                name="clientSpocIds"
                label="Client SPOC"
                title="Assign Client SPOC"
                cardDescription="Select client users who will be the point of contact for this project"
                roleFilter={UserRole.CLIENT}
                description="Select one or more client representatives"
              />
            </form>
          </Form>
        )}

        {/* Step 5: Interviewers */}
        {currentStep === 5 && (
          <Form {...step5Form}>
            <form className="space-y-6">
              <UserMultiSelect
                control={step5Form.control}
                name="interviewerIds"
                label="Interviewers"
                title="Assign Interviewers to Project"
                cardDescription="Select users who will conduct interviews for this project"
                roleFilter="NON_CLIENT"
                description="These interviewers will be available for assignment to candidates"
              />
            </form>
          </Form>
        )}

        {/* Step 6: Upload Candidates */}
        {currentStep === 6 && (
          <CandidateUploadTable
            expectedCount={noOfEmployees}
            onUpload={handleCandidateUpload}
            isUploading={uploadCandidates.isPending}
          />
        )}

        {/* Step 7: Assign Interviewers to Candidates */}
        {currentStep === 7 && projectId && (
          <InterviewerAssignment
            projectId={projectId}
            onManualAssign={handleManualAssign}
            onAutoAssign={handleAutoAssign}
            isAssigning={
              assignInterviewer.isPending || autoAssignInterviewers.isPending
            }
          />
        )}

        {/* Step 8: Review & Launch */}
        {currentStep === 8 && (
          <div className="space-y-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">
                Project Setup Complete!
              </h2>
              <p className="text-gray-600 mb-8">
                Your project is ready to launch. Click the button below to check
                readiness and start the project.
              </p>
              <Button
                onClick={() => setShowReadinessDialog(true)}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                Check Readiness & Launch Project
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1 || isLoading}
        >
          Previous
        </Button>

        <Button
          type="button"
          onClick={handleNext}
          disabled={isLoading || (currentStep === 7 && !projectId)}
        >
          {isLoading
            ? "Processing..."
            : currentStep === 8
            ? "Launch Project"
            : "Next"}
        </Button>
      </div>

      {/* Readiness Dialog */}
      {projectId && (
        <ReadinessChecklist
          projectId={projectId}
          onConfirmStart={handleStartProject}
          isStarting={updateProjectStatus.isPending}
          open={showReadinessDialog}
          onOpenChange={setShowReadinessDialog}
        />
      )}
      </div>
    </ErrorBoundary>
  );
}
