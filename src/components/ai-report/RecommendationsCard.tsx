import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

interface RecommendationsCardProps {
  recommendations: string[];
}

export function RecommendationsCard({ recommendations }: RecommendationsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Recommendations</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {recommendations.map((recommendation, index) => (
            <li key={index} className="flex gap-3">
              <div className="mt-1.5 h-6 w-6 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-medium text-primary">{index + 1}</span>
              </div>
              <span className="text-sm leading-relaxed flex-1">{recommendation}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
