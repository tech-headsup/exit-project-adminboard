import { Control } from "react-hook-form";
import {
  FormControl,
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
import { ProjectBasicDetailsValues } from "@/lib/project-form-schema";
import { useCompanies } from "@/hooks/useCompany";

interface ProjectBasicDetailsFieldsProps {
  control: Control<ProjectBasicDetailsValues>;
}

export function ProjectBasicDetailsFields({
  control,
}: ProjectBasicDetailsFieldsProps) {
  // Fetch companies with limit of 100
  const { data: companiesData, isLoading: isLoadingCompanies } = useCompanies({
    limit: 100,
  });

  const companies = companiesData?.data?.companies || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Selection */}
        <FormField
          control={control}
          name="companyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingCompanies ? (
                    <SelectItem value="loading" disabled>
                      Loading companies...
                    </SelectItem>
                  ) : companies.length === 0 ? (
                    <SelectItem value="no-companies" disabled>
                      No companies found
                    </SelectItem>
                  ) : (
                    companies.map((company) => (
                      <SelectItem key={company._id} value={company._id}>
                        {company.nameOfCompany}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Project Name */}
        <FormField
          control={control}
          name="projectName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name *</FormLabel>
              <FormControl>
                <Input placeholder="Q4 2024 Exit Interviews" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Project Type */}
        <FormField
          control={control}
          name="projectType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Type *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={ProjectType.EXIT}>Exit Interview</SelectItem>
                  <SelectItem value={ProjectType.OFFER_DROPOUT}>
                    Offer Dropout
                  </SelectItem>
                  <SelectItem value={ProjectType.STAY}>Stay Interview</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Number of Employees */}
        <FormField
          control={control}
          name="noOfEmployees"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Employees *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="50"
                  min={1}
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
