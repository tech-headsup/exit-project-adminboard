import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SpecialInsights, WouldReturnAnswer } from "@/types/aiReportTypes";
import { Crown, Building2, RotateCcw, CheckCircle, XCircle, HelpCircle } from "lucide-react";

interface SpecialInsightsCardProps {
  insights?: SpecialInsights;
}

/**
 * Get would return badge configuration
 */
const getWouldReturnConfig = (answer: WouldReturnAnswer) => {
  switch (answer) {
    case WouldReturnAnswer.YES:
      return {
        icon: CheckCircle,
        label: "Yes",
        variant: "default" as const,
        bgColor: "bg-green-100 dark:bg-green-900/30",
        textColor: "text-green-700 dark:text-green-400",
      };
    case WouldReturnAnswer.NO:
      return {
        icon: XCircle,
        label: "No",
        variant: "destructive" as const,
        bgColor: "bg-red-100 dark:bg-red-900/30",
        textColor: "text-red-700 dark:text-red-400",
      };
    case WouldReturnAnswer.MAYBE:
      return {
        icon: HelpCircle,
        label: "Maybe",
        variant: "secondary" as const,
        bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
        textColor: "text-yellow-700 dark:text-yellow-400",
      };
  }
};

export function SpecialInsightsCard({ insights }: SpecialInsightsCardProps) {
  if (!insights) return null;

  const wouldReturnConfig = insights.wouldReturn
    ? getWouldReturnConfig(insights.wouldReturn.answer)
    : null;
  const WouldReturnIcon = wouldReturnConfig?.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Special Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Leadership Style */}
        {insights.leadershipStyle && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">Leadership Style</h4>
            </div>
            <p className="text-sm text-muted-foreground pl-6">
              {insights.leadershipStyle}
            </p>
          </div>
        )}

        {/* Culture Summary */}
        {insights.cultureSummary && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">Culture Summary</h4>
            </div>
            <p className="text-sm text-muted-foreground pl-6 leading-relaxed">
              {insights.cultureSummary}
            </p>
          </div>
        )}

        {/* Would Return */}
        {insights.wouldReturn && wouldReturnConfig && WouldReturnIcon && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-muted-foreground" />
              <h4 className="text-sm font-medium">Would the Candidate Return?</h4>
            </div>
            <div className="pl-6 space-y-2">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${wouldReturnConfig.bgColor}`}>
                <WouldReturnIcon className={`h-4 w-4 ${wouldReturnConfig.textColor}`} />
                <span className={`text-sm font-medium ${wouldReturnConfig.textColor}`}>
                  {wouldReturnConfig.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {insights.wouldReturn.reasoning}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
