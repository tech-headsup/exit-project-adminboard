import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RiskLevel } from "@/types/aiReportTypes";
import { AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";

interface RiskAssessmentCardProps {
  riskLevel: RiskLevel;
}

/**
 * Get risk level configuration
 */
const getRiskLevelConfig = (level: RiskLevel) => {
  switch (level) {
    case RiskLevel.LOW:
      return {
        icon: CheckCircle2,
        label: "Low Risk",
        description: "The candidate's feedback indicates minimal concerns. No immediate action required.",
        bgColor: "bg-green-50 dark:bg-green-950",
        borderColor: "border-green-300 dark:border-green-700",
        textColor: "text-green-700 dark:text-green-300",
        iconColor: "text-green-600 dark:text-green-400",
      };
    case RiskLevel.MEDIUM:
      return {
        icon: AlertCircle,
        label: "Medium Risk",
        description: "Some concerns identified that warrant attention. Consider implementing improvements in highlighted areas.",
        bgColor: "bg-yellow-50 dark:bg-yellow-950",
        borderColor: "border-yellow-300 dark:border-yellow-700",
        textColor: "text-yellow-700 dark:text-yellow-300",
        iconColor: "text-yellow-600 dark:text-yellow-400",
      };
    case RiskLevel.HIGH:
      return {
        icon: AlertTriangle,
        label: "High Risk",
        description: "Significant concerns identified that require immediate attention. Action recommended to prevent similar issues.",
        bgColor: "bg-red-50 dark:bg-red-950",
        borderColor: "border-red-300 dark:border-red-700",
        textColor: "text-red-700 dark:text-red-300",
        iconColor: "text-red-600 dark:text-red-400",
      };
  }
};

export function RiskAssessmentCard({ riskLevel }: RiskAssessmentCardProps) {
  const config = getRiskLevelConfig(riskLevel);
  const Icon = config.icon;

  return (
    <Card className={`${config.bgColor} ${config.borderColor} border-2`}>
      <CardHeader>
        <CardTitle className="text-lg">Risk Assessment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <div className={`rounded-full p-2 bg-background/50`}>
            <Icon className={`h-6 w-6 ${config.iconColor}`} />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${config.textColor}`}>
              {config.label}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {config.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
