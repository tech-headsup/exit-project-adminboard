import { Control } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectType } from "@/types/projectTypes";
import { useCompanies } from "@/hooks/useCompany";
import { useQuestionnaires } from "@/hooks/useQuestionnaire";
import { ProjectSetupValues } from "@/lib/project-form-schema";
import { Briefcase, FileText } from "lucide-react";

interface ProjectSetupProps {
  control: Control<ProjectSetupValues>;
}

export function ProjectSetup({ control }: ProjectSetupProps) {
  const { data: companiesData, isLoading: isLoadingCompanies } = useCompanies({
    page: 1,
    limit: 100,
  });

  const { data: questionnairesData, isLoading: isLoadingQuestionnaires } =
    useQuestionnaires({
      page: 1,
      limit: 100,
    });

  const companies = companiesData?.data?.companies || [];
  const questionnaires = questionnairesData?.data?.questionnaires || [];

  return (
    <div className="space-y-6">
      {/* Project Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            <CardTitle>Project Details</CardTitle>
          </div>
          <CardDescription>
            Set up the basic information for your project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={control}
            name="companyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoadingCompanies}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company._id} value={company._id}>
                        {company.nameOfCompany}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="projectName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Q1 Exit Interview 2024" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={control}
              name="projectType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Type *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={ProjectType.EXIT}>Exit</SelectItem>
                      <SelectItem value={ProjectType.OFFER_DROPOUT}>
                        Offer Dropout
                      </SelectItem>
                      <SelectItem value={ProjectType.STAY}>Stay</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="noOfEmployees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Employees *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 50"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Questionnaire Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            <CardTitle>Questionnaire Template</CardTitle>
          </div>
          <CardDescription>
            Select the questionnaire template to use for this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormField
            control={control}
            name="questionnaireId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Questionnaire *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoadingQuestionnaires}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a questionnaire template" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {questionnaires.map((questionnaire) => (
                      <SelectItem
                        key={questionnaire._id}
                        value={questionnaire._id}
                      >
                        {questionnaire.questionnaireName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  This questionnaire will be used for all interviews in this
                  project
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
