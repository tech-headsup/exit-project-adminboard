"use client";

import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Rating } from "@/components/ui/rating";
import { QuestionType } from "@/types/questionnaireTypes";
import { AnswerValue } from "@/types/answerTypes";

interface QuestionRendererProps {
  questionId: string;
  questionText: string;
  questionType: QuestionType;
  ratingScale?: { min: number; max: number };
  value: AnswerValue | "";
  onChange: (answer: AnswerValue | "") => void;
}

export function QuestionRenderer({
  questionId,
  questionText,
  questionType,
  ratingScale,
  value,
  onChange,
}: QuestionRendererProps) {
  const [localAnswer, setLocalAnswer] = useState<AnswerValue | "">(value);

  // Sync local state with prop changes
  useEffect(() => {
    setLocalAnswer(value);
  }, [value]);

  const handleAnswerChange = (newAnswer: AnswerValue | "") => {
    setLocalAnswer(newAnswer);
    onChange(newAnswer);
  };

  const renderAnswerInput = () => {
    switch (questionType) {
      case "TEXT":
        return (
          <Textarea
            value={localAnswer as string}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Type your answer here..."
            className="min-h-[120px]"
          />
        );

      case "RATING":
        if (!ratingScale) return null;

        return (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Rate from {ratingScale.min} to {ratingScale.max}
            </p>
            <Rating
              rating={Number(localAnswer) || 0}
              maxRating={ratingScale.max}
              editable={true}
              onRatingChange={handleAnswerChange}
              showValue={true}
              size="lg"
            />
          </div>
        );

      case "YES_NO":
        return (
          <RadioGroup
            value={localAnswer as string}
            onValueChange={handleAnswerChange}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Yes" id={`${questionId}-yes`} />
              <Label htmlFor={`${questionId}-yes`} className="cursor-pointer">
                Yes
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="No" id={`${questionId}-no`} />
              <Label htmlFor={`${questionId}-no`} className="cursor-pointer">
                No
              </Label>
            </div>
          </RadioGroup>
        );

      case "MULTIPLE_CHOICE":
        // For now use textarea, can be enhanced later
        return (
          <Textarea
            value={localAnswer as string}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Type your answer here..."
            className="min-h-[120px]"
          />
        );

      default:
        return (
          <Textarea
            value={localAnswer as string}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="Type your answer here..."
            className="min-h-[120px]"
          />
        );
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-medium mb-4">{questionText}</h3>
        {renderAnswerInput()}
      </div>
    </div>
  );
}
