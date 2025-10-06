import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuestionnaireSelectionValues } from "@/lib/project-form-schema";
import { useGlobalTemplates } from "@/hooks/useQuestionnaire";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface QuestionnaireSelectorProps {
  control: Control<QuestionnaireSelectionValues>;
}

export function QuestionnaireSelector({
  control,
}: QuestionnaireSelectorProps) {
  // Fetch global questionnaire templates
  const { data: templatesData, isLoading: isLoadingTemplates } =
    useGlobalTemplates({
      limit: 100,
    });

  const templates = templatesData?.data?.questionnaires || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Select Questionnaire Template
          </CardTitle>
          <CardDescription>
            Choose a questionnaire template for this project. You can select from
            global templates that match your project type.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={control}
            name="questionnaireId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Questionnaire Template *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a questionnaire template" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isLoadingTemplates ? (
                      <SelectItem value="loading" disabled>
                        Loading templates...
                      </SelectItem>
                    ) : templates.length === 0 ? (
                      <SelectItem value="no-templates" disabled>
                        No templates found
                      </SelectItem>
                    ) : (
                      templates.map((template) => (
                        <SelectItem key={template._id} value={template._id}>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {template.questionnaireName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {template.questionnaireType} •{" "}
                              {template.themes.length} themes
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormDescription>
                  This questionnaire will be used for all interviews in this project
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    </div>
  );
}
