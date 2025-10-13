import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks } from "lucide-react";

interface KeyFindingsCardProps {
  findings: string[];
}

export function KeyFindingsCard({ findings }: KeyFindingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <ListChecks className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg">Key Findings</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {findings.map((finding, index) => (
            <li key={index} className="flex gap-3">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              <span className="text-sm leading-relaxed flex-1">{finding}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
