import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle, AlertCircle, Rocket } from "lucide-react";
import { useProjectReadiness } from "@/hooks/useProject";

interface ReadinessChecklistProps {
  projectId: string;
  onConfirmStart: () => void;
  isStarting: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReadinessChecklist({
  projectId,
  onConfirmStart,
  isStarting,
  open,
  onOpenChange,
}: ReadinessChecklistProps) {
  const { data: readinessData, isLoading } = useProjectReadiness(
    projectId,
    open
  );

  const readiness = readinessData?.data;

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Checking Project Readiness...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const checks = readiness?.checks || {
    questionnaireAssigned: false,
    candidatesUploaded: false,
    allCandidatesAssigned: false,
    clientSpocAssigned: false,
    headsUpSpocAssigned: false,
  };

  const isReady = readiness?.isReady || false;
  const blockers = readiness?.blockers || [];

  const checkItems = [
    {
      label: "Questionnaire Assigned",
      status: checks.questionnaireAssigned,
      description: "A questionnaire template has been assigned to the project",
    },
    {
      label: "Candidates Uploaded",
      status: checks.candidatesUploaded,
      description: "Candidate data has been uploaded",
    },
    {
      label: "All Candidates Assigned",
      status: checks.allCandidatesAssigned,
      description: "Every candidate has been assigned to an interviewer",
    },
    {
      label: "Client SPOC Assigned (Optional)",
      status: checks.clientSpocAssigned,
      description: "Client SPOC can be assigned now or later",
    },
    {
      label: "Heads-Up SPOC Assigned",
      status: checks.headsUpSpocAssigned,
      description: "At least one heads-up SPOC has been assigned",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            Project Readiness Check
          </DialogTitle>
          <DialogDescription>
            Review the checklist below before launching the project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Overall Status Alert */}
          {isReady ? (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">
                Ready to Launch!
              </AlertTitle>
              <AlertDescription className="text-green-700">
                {readiness?.message ||
                  "All requirements are met. You can start the project."}
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800">Incomplete Setup</AlertTitle>
              <AlertDescription className="text-yellow-700">
                Some requirements are not complete. You can launch the project now
                and complete these items later.
              </AlertDescription>
            </Alert>
          )}

          {/* Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Requirements Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {checkItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded border"
                >
                  {item.status ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Blockers */}
          {/* {blockers.length > 0 && (
            <Card className="">
              <CardHeader>
                <CardTitle className="text-sm text-yellow-800">
                  Action Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {blockers.map((blocker, index) => (
                    <li key={index} className="text-sm text-yellow-700">
                      {blocker}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )} */}
        </div>

        <DialogFooter>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            disabled={isStarting}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirmStart}
            disabled={isStarting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isStarting ? "Starting..." : isReady ? "Confirm & Start Project" : "Start Project Anyway"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
