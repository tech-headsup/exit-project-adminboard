import { Control, FieldValues, Path, Controller } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Select from "react-select";

interface CompanyBasicDetailsFieldsProps<T extends FieldValues> {
  control: Control<T>;
}

const companySizeOptions = [
  { value: "STARTUP", label: "Startup (1-50 employees)" },
  { value: "SMALL", label: "Small (51-200 employees)" },
  { value: "MEDIUM", label: "Medium (201-1000 employees)" },
  { value: "LARGE", label: "Large (1001-5000 employees)" },
  { value: "ENTERPRISE", label: "Enterprise (5000+ employees)" },
];

export function CompanyBasicDetailsFields<T extends FieldValues>({
  control,
}: CompanyBasicDetailsFieldsProps<T>) {
  return (
    <div className="space-y-4">
      {/* ... other FormFields for nameOfCompany and companyEmail ... */}
      <FormField
        control={control}
        name={"nameOfCompany" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name of Company</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={"companyEmail" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Company Email <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                type="email"
                placeholder="company@example.com"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Controller
        control={control}
        name={"companySize" as Path<T>}
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>Company Size</FormLabel>
            <FormControl>
              <Select
                {...field}
                options={companySizeOptions}
                value={
                  companySizeOptions.find(
                    (option) => option.value === field.value
                  ) || null
                }
                onChange={(selectedOption) => {
                  field.onChange(selectedOption?.value || "");
                }}
                onBlur={field.onBlur}
                placeholder="Select company size"
                isClearable
                className="react-select-container"
                classNamePrefix="react-select"
              />
            </FormControl>
            {fieldState.error && (
              <FormMessage>{fieldState.error.message}</FormMessage>
            )}
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={"companyWebsiteURL" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Website Address</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
