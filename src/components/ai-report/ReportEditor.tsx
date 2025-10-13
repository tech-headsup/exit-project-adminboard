import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useReportStore } from "@/stores/reportStore";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { WouldReturnAnswer } from "@/types/aiReportTypes";

export function ReportEditor() {
  const {
    editedReport,
    updateExecutiveSummary,
    updateOverallSentiment,
    updateKeyFinding,
    addKeyFinding,
    removeKeyFinding,
    updateThemeInsight,
    updateRatingQuestion,
    updateLeadershipStyle,
    updateCultureSummary,
    updateWouldReturn,
    updateRiskLevel,
    updateRecommendation,
    addRecommendation,
    removeRecommendation,
  } = useReportStore();

  if (!editedReport) return null;

  return (
    <div className="space-y-6">
      {/* Executive Summary Section */}
      <Card>
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="executiveSummary">Summary</Label>
            <Textarea
              id="executiveSummary"
              value={editedReport.executiveSummary}
              onChange={(e) => updateExecutiveSummary(e.target.value)}
              rows={6}
              placeholder="Enter executive summary..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="overallSentiment">Overall Sentiment</Label>
            <Select
              value={editedReport.overallSentiment}
              onValueChange={(value: any) => updateOverallSentiment(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="POSITIVE">Positive</SelectItem>
                <SelectItem value="NEUTRAL">Neutral</SelectItem>
                <SelectItem value="NEGATIVE">Negative</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Key Findings Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Key Findings</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addKeyFinding}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Finding
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {editedReport.keyFindings.map((finding, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                value={finding}
                onChange={(e) => updateKeyFinding(index, e.target.value)}
                rows={2}
                placeholder="Enter key finding..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeKeyFinding(index)}
                disabled={editedReport.keyFindings.length === 1}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Theme Insights Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Theme Insights</h3>
        {editedReport.themeInsights.map((theme, themeIndex) => (
          <Card key={theme.themeId}>
            <CardHeader>
              <CardTitle className="text-base">{theme.themeName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Theme Name (read-only from backend) */}
              <div className="space-y-2">
                <Label>Theme Name</Label>
                <Input value={theme.themeName} disabled />
              </div>

              {/* One-liner */}
              <div className="space-y-2">
                <Label htmlFor={`oneLiner-${themeIndex}`}>One-liner Quote</Label>
                <Textarea
                  id={`oneLiner-${themeIndex}`}
                  value={theme.oneLiner}
                  onChange={(e) =>
                    updateThemeInsight(themeIndex, "oneLiner", e.target.value)
                  }
                  rows={2}
                  placeholder="Enter one-liner quote..."
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor={`description-${themeIndex}`}>Description</Label>
                <Textarea
                  id={`description-${themeIndex}`}
                  value={theme.description}
                  onChange={(e) =>
                    updateThemeInsight(themeIndex, "description", e.target.value)
                  }
                  rows={4}
                  placeholder="Enter detailed description..."
                />
              </div>

              {/* Rating Questions */}
              {theme.ratingQuestions.length > 0 && (
                <div className="space-y-3">
                  <Label>Rating Questions</Label>
                  {theme.ratingQuestions.map((question, ratingIndex) => (
                    <div
                      key={ratingIndex}
                      className="border rounded-lg p-3 space-y-3"
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

                      <div className="space-y-2">
                        <Label htmlFor={`rating-${themeIndex}-${ratingIndex}`}>
                          Rating (1-10)
                        </Label>
                        <Input
                          id={`rating-${themeIndex}-${ratingIndex}`}
                          type="number"
                          min={1}
                          max={10}
                          value={question.rating}
                          onChange={(e) =>
                            updateRatingQuestion(
                              themeIndex,
                              ratingIndex,
                              "rating",
                              parseInt(e.target.value) || 1
                            )
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Special Insights Section */}
      <Card>
        <CardHeader>
          <CardTitle>Special Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Leadership Style */}
          <div className="space-y-2">
            <Label htmlFor="leadershipStyle">Leadership Style</Label>
            <Input
              id="leadershipStyle"
              value={editedReport.specialInsights?.leadershipStyle || ""}
              onChange={(e) => updateLeadershipStyle(e.target.value)}
              placeholder="e.g., Democratic, Autocratic, Laissez-faire"
            />
          </div>

          {/* Culture Summary */}
          <div className="space-y-2">
            <Label htmlFor="cultureSummary">Culture Summary</Label>
            <Textarea
              id="cultureSummary"
              value={editedReport.specialInsights?.cultureSummary || ""}
              onChange={(e) => updateCultureSummary(e.target.value)}
              rows={3}
              placeholder="Enter culture summary..."
            />
          </div>

          <Separator />

          {/* Would Return */}
          <div className="space-y-3">
            <Label>Would the Candidate Return?</Label>
            <div className="space-y-3">
              <Select
                value={editedReport.specialInsights?.wouldReturn?.answer || WouldReturnAnswer.MAYBE}
                onValueChange={(value: any) =>
                  updateWouldReturn(
                    value as WouldReturnAnswer,
                    editedReport.specialInsights?.wouldReturn?.reasoning || ""
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={WouldReturnAnswer.YES}>Yes</SelectItem>
                  <SelectItem value={WouldReturnAnswer.NO}>No</SelectItem>
                  <SelectItem value={WouldReturnAnswer.MAYBE}>Maybe</SelectItem>
                </SelectContent>
              </Select>

              <Textarea
                value={editedReport.specialInsights?.wouldReturn?.reasoning || ""}
                onChange={(e) =>
                  updateWouldReturn(
                    editedReport.specialInsights?.wouldReturn?.answer || WouldReturnAnswer.MAYBE,
                    e.target.value
                  )
                }
                rows={3}
                placeholder="Enter reasoning..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Level Section */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="riskLevel">Risk Level</Label>
            <Select
              value={editedReport.riskLevel}
              onValueChange={(value: any) => updateRiskLevel(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recommendations</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRecommendation}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Recommendation
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {editedReport.recommendations.map((recommendation, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                value={recommendation}
                onChange={(e) => updateRecommendation(index, e.target.value)}
                rows={2}
                placeholder="Enter recommendation..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeRecommendation(index)}
                disabled={editedReport.recommendations.length === 1}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
