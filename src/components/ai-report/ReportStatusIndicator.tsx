import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportStatus } from "@/types/aiReportTypes";

interface ReportStatusIndicatorProps {
  status: ReportStatus;
  processingTimeMs?: number;
  error?: string | null;
  generatedAt?: string;
}

/**
 * Get badge variant and color based on status
 */
const getStatusConfig = (status: ReportStatus) => {
  switch (status) {
    case ReportStatus.PENDING:
      return {
        variant: "default" as const,
        icon: Loader2,
        label: "Generating Report...",
        description: "AI is analyzing the interview responses and generating insights.",
        bgColor: "bg-blue-50 dark:bg-blue-950",
        textColor: "text-blue-700 dark:text-blue-300",
      };
    case ReportStatus.COMPLETED:
      return {
        variant: "secondary" as const,
        icon: CheckCircle2,
        label: "Report Generated",
        description: "AI-generated report is ready for review.",
        bgColor: "bg-green-50 dark:bg-green-950",
        textColor: "text-green-700 dark:text-green-300",
      };
    case ReportStatus.FAILED:
      return {
        variant: "destructive" as const,
        icon: XCircle,
        label: "Generation Failed",
        description: "Failed to generate the report. Please try again or contact support.",
        bgColor: "bg-red-50 dark:bg-red-950",
        textColor: "text-red-700 dark:text-red-300",
      };
  }
};

/**
 * Format processing time for display
 */
const formatProcessingTime = (ms?: number): string => {
  if (!ms) return "";

  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

/**
 * Format generated date for display
 */
const formatGeneratedAt = (dateString?: string): string => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export function ReportStatusIndicator({
  status,
  processingTimeMs,
  error,
  generatedAt,
}: ReportStatusIndicatorProps) {
  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Card className={config.bgColor}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${config.textColor} bg-background/50`}>
              <Icon
                className={`h-5 w-5 ${status === ReportStatus.PENDING ? "animate-spin" : ""}`}
              />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {config.label}
                <Badge variant={config.variant}>{status}</Badge>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {config.description}
              </p>
            </div>
          </div>

          {/* Processing time / Generated time */}
          {status === ReportStatus.PENDING && processingTimeMs && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Est. {formatProcessingTime(processingTimeMs)}</span>
            </div>
          )}

          {status === ReportStatus.COMPLETED && generatedAt && (
            <div className="text-sm text-muted-foreground">
              Generated {formatGeneratedAt(generatedAt)}
            </div>
          )}
        </div>
      </CardHeader>

      {/* Error message */}
      {status === ReportStatus.FAILED && error && (
        <CardContent>
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
            <p className="text-sm text-destructive font-medium">Error Details:</p>
            <p className="text-sm text-destructive/80 mt-1">{error}</p>
          </div>
        </CardContent>
      )}

      {/* Pending progress info */}
      {status === ReportStatus.PENDING && (
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <span>Analyzing interview responses...</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse delay-150" />
              <span>Generating insights and recommendations...</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse delay-300" />
              <span>Finalizing report structure...</span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
