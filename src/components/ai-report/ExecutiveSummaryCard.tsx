import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OverallSentiment } from "@/types/aiReportTypes";
import { SmilePlus, Meh, Frown } from "lucide-react";

interface ExecutiveSummaryCardProps {
  summary: string;
  sentiment: OverallSentiment;
}

/**
 * Get sentiment badge configuration
 */
const getSentimentConfig = (sentiment: OverallSentiment) => {
  switch (sentiment) {
    case OverallSentiment.POSITIVE:
      return {
        icon: SmilePlus,
        label: "Positive",
        variant: "default" as const,
        bgColor: "bg-green-100 dark:bg-green-900/30",
        textColor: "text-green-700 dark:text-green-400",
        borderColor: "border-green-300 dark:border-green-700",
      };
    case OverallSentiment.NEUTRAL:
      return {
        icon: Meh,
        label: "Neutral",
        variant: "secondary" as const,
        bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
        textColor: "text-yellow-700 dark:text-yellow-400",
        borderColor: "border-yellow-300 dark:border-yellow-700",
      };
    case OverallSentiment.NEGATIVE:
      return {
        icon: Frown,
        label: "Negative",
        variant: "destructive" as const,
        bgColor: "bg-red-100 dark:bg-red-900/30",
        textColor: "text-red-700 dark:text-red-400",
        borderColor: "border-red-300 dark:border-red-700",
      };
  }
};

export function ExecutiveSummaryCard({ summary, sentiment }: ExecutiveSummaryCardProps) {
  const config = getSentimentConfig(sentiment);
  const Icon = config.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Executive Summary</CardTitle>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bgColor} ${config.borderColor} border`}>
            <Icon className={`h-4 w-4 ${config.textColor}`} />
            <span className={`text-sm font-medium ${config.textColor}`}>
              {config.label} Sentiment
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {summary}
        </p>
      </CardContent>
    </Card>
  );
}
