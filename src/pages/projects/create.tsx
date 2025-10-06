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
import {
  CandidateRow,
  convertToExcelCandidateRow,
} from "@/lib/candidate-upload-schema";

// Schemas
import {
  projectSetupSchema,
  teamAssignmentSchema,
  projectFormSteps,
  projectStepLabels,
  ProjectSetupValues,
  TeamAssignmentValues,
} from "@/lib/project-form-schema";

// Components
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProjectFormSteps } from "@/components/project/ProjectFormSteps";
import { ProjectSetup } from "@/components/project/ProjectSetup";
import { TeamAssignment } from "@/components/project/TeamAssignment";
import { CandidateUploadTable } from "@/components/project/CandidateUploadTable";
import { InterviewerAssignment } from "@/components/project/InterviewerAssignment";
import { ReadinessChecklist } from "@/components/project/ReadinessChecklist";

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

  // Only fetch in Step 4 (Interviewer Assignment)
  const { data: projectData } = useProjectById(
    projectId || "",
    !!projectId && currentStep === 4
  );

  // Mutations
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const uploadCandidates = useUploadCandidates();
  const assignInterviewer = useAssignInterviewer();
  const autoAssignInterviewers = useAutoAssignInterviewers();
  const updateProjectStatus = useUpdateProjectStatus();

  // Forms for 5-step flow
  const step1Form = useForm<ProjectSetupValues>({
    resolver: zodResolver(projectSetupSchema),
    defaultValues: {
      companyId: "",
      projectName: "",
      projectType: undefined,
      noOfEmployees: 0,
      questionnaireId: "",
    },
  });

  const step2Form = useForm<TeamAssignmentValues>({
    resolver: zodResolver(teamAssignmentSchema),
    defaultValues: {
      headsUpSpocIds: [],
      clientSpocIds: [],
      interviewerIds: [],
    },
  });

  // Step 1: Project Setup (Create + Questionnaire)
  const handleStep1Submit = async (data: ProjectSetupValues) => {
    try {
      const response = await createProject.mutateAsync({
        companyId: data.companyId,
        projectName: data.projectName,
        projectType: data.projectType,
        noOfEmployees: data.noOfEmployees,
        questionnaireId: data.questionnaireId,
      });
      setNoOfEmployees(data.noOfEmployees);
      toast.success("Project created successfully!");
      await setProjectId(response.data._id);
      await setCurrentStep(2);
    } catch (error) {
      toast.error("Failed to create project", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Step 2: Team Assignment (Heads-Up SPOC + Client SPOC + Interviewers)
  const handleStep2Submit = async (data: TeamAssignmentValues) => {
    if (!projectId) {
      toast.error("Project ID not found");
      return;
    }

    try {
      await updateProject.mutateAsync({
        id: projectId,
        headsUpSpocIds: data.headsUpSpocIds,
        clientSpocIds: data.clientSpocIds,
        interviewerIds: data.interviewerIds,
      });
      toast.success("Team assigned successfully!");
      setCurrentStep(3);
    } catch (error) {
      toast.error("Failed to assign team", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Step 3: Upload Candidates
  const handleCandidateUpload = async (candidates: CandidateRow[]) => {
    if (!projectId || !user) {
      toast.error("Project ID or User not found");
      return;
    }

    try {
      const excelCandidates = candidates.map(convertToExcelCandidateRow);

      await uploadCandidates.mutateAsync({
        projectId,
        uploadedBy: user._id,
        candidates: excelCandidates,
      });
      toast.success(`${candidates.length} candidates uploaded successfully!`);
      setCurrentStep(4);
    } catch (error) {
      toast.error("Failed to upload candidates", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Step 4: Assign Interviewers to Candidates (Manual)
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

  // Step 4: Auto-Assign Interviewers to Candidates
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
      setCurrentStep(5);
    } catch (error) {
      toast.error("Failed to auto-assign interviewers", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Step 5: Start Project
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
      toast.info("Please upload candidates to continue");
    } else if (currentStep === 4) {
      setCurrentStep(5);
    } else if (currentStep === 5) {
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

        <div className="min-h-[400px] min-w-[50vw]">
          {/* Step 1: Project Setup */}
          {currentStep === 1 && (
            <Form {...step1Form}>
              <form className="space-y-6">
                <ProjectSetup control={step1Form.control} />
              </form>
            </Form>
          )}

          {/* Step 2: Team Assignment */}
          {currentStep === 2 && (
            <Form {...step2Form}>
              <form className="space-y-6">
                <TeamAssignment control={step2Form.control} />
              </form>
            </Form>
          )}

          {/* Step 3: Upload Candidates */}
          {currentStep === 3 && (
            <CandidateUploadTable
              expectedCount={noOfEmployees}
              onUpload={handleCandidateUpload}
              isUploading={uploadCandidates.isPending}
            />
          )}

          {/* Step 4: Assign Interviewers to Candidates */}
          {currentStep === 4 && projectId && (
            <InterviewerAssignment
              projectId={projectId}
              onManualAssign={handleManualAssign}
              onAutoAssign={handleAutoAssign}
              isAssigning={
                assignInterviewer.isPending || autoAssignInterviewers.isPending
              }
            />
          )}

          {/* Step 5: Review & Launch */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">
                  Project Setup Complete!
                </h2>
                <p className="text-gray-600 mb-8">
                  Your project is ready to launch. Click the button below to
                  check readiness and start the project.
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
            disabled={isLoading || (currentStep === 4 && !projectId)}
          >
            {isLoading
              ? "Processing..."
              : currentStep === 5
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
