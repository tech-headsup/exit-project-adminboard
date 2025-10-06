import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, Users, Info } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCandidates } from "@/hooks/useCandidate";
import { useProjectById } from "@/hooks/useProject";
import { PopulatedUser } from "@/types/projectTypes";

interface InterviewerAssignmentProps {
  projectId: string;
  onManualAssign: (candidateIds: string[], interviewerId: string) => void;
  onAutoAssign: () => void;
  isAssigning: boolean;
}

export function InterviewerAssignment({
  projectId,
  onManualAssign,
  onAutoAssign,
  isAssigning,
}: InterviewerAssignmentProps) {
  const [assignmentMode, setAssignmentMode] = useState<
    "manual" | "auto" | null
  >(null);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [selectedInterviewer, setSelectedInterviewer] = useState<string>("");

  // Fetch project to get interviewers (should be populated by backend)
  const { data: projectData, isLoading: isLoadingProject } =
    useProjectById(projectId);

  // Fetch candidates for this project
  const { data: candidatesData, isLoading: isLoadingCandidates } =
    useCandidates({
      search: { projectId },
      limit: 1000,
    });

  const candidates = candidatesData?.data?.candidates || [];
  const project = projectData?.data;

  // Get populated interviewers from project
  const interviewers = (project?.interviewerIds || []) as PopulatedUser[];

  const handleToggleCandidate = (candidateId: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleBulkAssign = () => {
    if (selectedCandidates.length > 0 && selectedInterviewer) {
      onManualAssign(selectedCandidates, selectedInterviewer);
      setSelectedCandidates([]);
      setSelectedInterviewer("");
    }
  };

  if (assignmentMode === null) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Choose Assignment Method</CardTitle>
            <CardDescription>
              Select how you want to assign interviewers to candidates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => setAssignmentMode("auto")}
              className="w-full h-auto py-6"
              variant="outline"
              disabled={isLoadingProject || interviewers.length === 0}
            >
              <div className="flex flex-col items-center gap-2">
                <Sparkles className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-semibold text-lg">
                    Auto-Assign (Recommended)
                  </p>
                  <p className="text-sm text-gray-500">
                    Automatically distribute candidates evenly among{" "}
                    {interviewers.length} interviewer(s)
                  </p>
                </div>
              </div>
            </Button>

            {/* <Button
              onClick={() => setAssignmentMode("manual")}
              className="w-full h-auto py-6"
              variant="outline"
              disabled={isLoadingProject || interviewers.length === 0}
            >
              <div className="flex flex-col items-center gap-2">
                <Users className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-semibold text-lg">Manual Assignment</p>
                  <p className="text-sm text-gray-500">
                    Manually assign interviewers to individual candidates
                  </p>
                </div>
              </div>
            </Button> */}

            {isLoadingProject && (
              <p className="text-sm text-gray-500 text-center">
                Loading project interviewers...
              </p>
            )}

            {!isLoadingProject && interviewers.length === 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  No interviewers found for this project. Please go back to Step
                  5 and assign interviewers.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (assignmentMode === "auto") {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Auto-Assign Interviewers
            </CardTitle>
            <CardDescription>
              This will automatically distribute all candidates evenly among the
              selected interviewers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                {candidates.length} candidate(s) will be distributed among{" "}
                {interviewers.length} interviewer(s). Each interviewer will
                receive approximately{" "}
                {Math.ceil(candidates.length / (interviewers.length || 1))}{" "}
                candidates.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <p className="font-semibold text-sm">Interviewers:</p>
              <ul className="list-disc list-inside space-y-1">
                {interviewers.map((interviewer) => (
                  <li key={interviewer._id} className="text-sm">
                    {interviewer.firstName} {interviewer.lastName}
                    {interviewer.email && ` (${interviewer.email})`}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => setAssignmentMode(null)}
                variant="outline"
                disabled={isAssigning}
              >
                Back
              </Button>
              <Button
                onClick={onAutoAssign}
                disabled={isAssigning || interviewers.length === 0}
                className="flex-1"
              >
                {isAssigning ? "Assigning..." : "Confirm Auto-Assign"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Manual assignment mode
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Manual Assignment
          </CardTitle>
          <CardDescription>
            Select candidates and assign them to an interviewer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Select Interviewer
              </label>
              <Select
                value={selectedInterviewer}
                onValueChange={setSelectedInterviewer}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an interviewer" />
                </SelectTrigger>
                <SelectContent>
                  {interviewers.map((interviewer) => (
                    <SelectItem
                      key={interviewer._id}
                      value={interviewer._id}
                    >
                      {interviewer.firstName} {interviewer.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleBulkAssign}
              disabled={
                selectedCandidates.length === 0 ||
                !selectedInterviewer ||
                isAssigning
              }
            >
              Assign Selected ({selectedCandidates.length})
            </Button>
          </div>

          <div className="border rounded">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCandidates(candidates.map((c) => c._id));
                        } else {
                          setSelectedCandidates([]);
                        }
                      }}
                      checked={
                        candidates.length > 0 &&
                        selectedCandidates.length === candidates.length
                      }
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Assigned To</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingCandidates ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Loading candidates...
                    </TableCell>
                  </TableRow>
                ) : candidates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No candidates found
                    </TableCell>
                  </TableRow>
                ) : (
                  candidates.map((candidate) => {
                    const assignedInterviewer =
                      typeof candidate.assignedInterviewer === "object"
                        ? candidate.assignedInterviewer
                        : null;

                    return (
                      <TableRow key={candidate._id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedCandidates.includes(candidate._id)}
                            onChange={() =>
                              handleToggleCandidate(candidate._id)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {candidate.name}
                        </TableCell>
                        <TableCell>{candidate.email}</TableCell>
                        <TableCell>{candidate.department}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              candidate.overallStatus === "NEW"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {candidate.overallStatus}
                          </span>
                        </TableCell>
                        <TableCell>
                          {assignedInterviewer
                            ? `${assignedInterviewer.firstName} ${assignedInterviewer.lastName}`
                            : "Unassigned"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <Button
            onClick={() => setAssignmentMode(null)}
            variant="outline"
            disabled={isAssigning}
          >
            Back to Assignment Methods
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
