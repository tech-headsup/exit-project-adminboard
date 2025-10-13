import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeInsight } from "@/types/aiReportTypes";
import { Quote, Star, Sparkles } from "lucide-react";

interface ThemeInsightCardProps {
  theme: ThemeInsight;
}

export function ThemeInsightCard({ theme }: ThemeInsightCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{theme.themeName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* One-liner quote */}
        <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
          <div className="flex items-start gap-2">
            <Quote className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm italic leading-relaxed">&quot;{theme.oneLiner}&quot;</p>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-sm font-medium mb-2">Detailed Perspective</h4>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {theme.description}
          </p>
        </div>

        {/* Rating questions */}
        {theme.ratingQuestions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Rating Insights</h4>
            <div className="space-y-3">
              {theme.ratingQuestions.map((question, index) => (
                <div
                  key={index}
                  className="bg-background rounded-lg p-3 border space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm flex-1">{question.questionText}</p>
                    {question.isInferred && (
                      <Badge variant="secondary" className="flex-shrink-0 text-xs">
                        <Sparkles className="h-3 w-3 mr-1" />
                        AI Inferred
                      </Badge>
                    )}
                  </div>

                  {/* Rating display */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-2 rounded-full ${
                            i < question.rating
                              ? "bg-primary"
                              : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold">
                      {question.rating}/10
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
