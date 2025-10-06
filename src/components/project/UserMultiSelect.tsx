import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import MultipleSelector, { Option } from "@/components/ui/multiselect";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSearchUsers } from "@/hooks/useUsers";
import { UserRole } from "@/types/userTypes";
import { Users } from "lucide-react";

interface UserMultiSelectProps {
  control: Control<any>;
  name: string;
  label: string;
  description?: string;
  roleFilter?: UserRole | "NON_CLIENT"; // NON_CLIENT means all except CLIENT
  title?: string;
  cardDescription?: string;
}

export function UserMultiSelect({
  control,
  name,
  label,
  description,
  roleFilter,
  title,
  cardDescription,
}: UserMultiSelectProps) {
  // Build search filter based on role
  const searchFilter = roleFilter
    ? roleFilter === "NON_CLIENT"
      ? {
          role: { $ne: UserRole.CLIENT },
        } // We'll filter manually for NON_CLIENT
      : { role: roleFilter }
    : {};

  const { data: usersData, isLoading: isLoadingUsers } = useSearchUsers({
    limit: 100,
    // @ts-expect-error - searchFilter type mismatch with useSearchUsers
    search: searchFilter,
  });

  const users = usersData?.data || [];

  // Convert users to options for MultipleSelector (backend already filters by role)
  const userOptions: Option[] = users.map((user) => ({
    value: user._id,
    label: `${user.firstName} ${user.lastName} (${user.role})`,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {title || label}
        </CardTitle>
        {cardDescription && (
          <CardDescription>{cardDescription}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <FormField
          control={control}
          name={name}
          render={({ field }) => {
            // Convert field value (array of IDs) to options
            const selectedOptions = userOptions.filter((option) =>
              field.value?.includes(option.value)
            );

            return (
              <FormItem>
                <FormLabel>{label} *</FormLabel>
                <FormControl>
                  <MultipleSelector
                    commandProps={{
                      label: `Select ${label}`,
                    }}
                    value={selectedOptions}
                    onChange={(selected) => {
                      // Convert selected options back to array of IDs
                      field.onChange(selected.map((opt) => opt.value));
                    }}
                    defaultOptions={userOptions}
                    options={userOptions}
                    placeholder={
                      isLoadingUsers
                        ? "Loading users..."
                        : userOptions.length === 0
                        ? "No users found"
                        : `Select ${label.toLowerCase()}`
                    }
                    hidePlaceholderWhenSelected
                    emptyIndicator={
                      <p className="text-center text-sm text-gray-500">
                        No users found
                      </p>
                    }
                    disabled={isLoadingUsers || userOptions.length === 0}
                  />
                </FormControl>
                {description && (
                  <FormDescription>{description}</FormDescription>
                )}
                <FormMessage />
              </FormItem>
            );
          }}
        />
      </CardContent>
    </Card>
  );
}
