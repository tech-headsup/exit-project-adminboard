import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MultipleSelector, { Option } from "@/components/ui/multiselect";
import { useUpdateProject } from "@/hooks/useProject";
import { useSearchUsers } from "@/hooks/useUsers";
import { PopulatedUser } from "@/types/projectTypes";
import { User, UserRole } from "@/types/userTypes";
import { UserIcon, Mail } from "lucide-react";

interface UserAssignmentTabProps {
  projectId: string;
  fieldName: "headsUpSpocIds" | "clientSpocIds" | "interviewerIds";
  title: string;
  description: string;
  currentUsers: string[] | PopulatedUser[];
}

export function UserAssignmentTab({
  projectId,
  fieldName,
  title,
  description,
  currentUsers,
}: UserAssignmentTabProps) {
  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject();

  // Role filter based on fieldName
  const searchFilter = useMemo(() => {
    if (fieldName === "clientSpocIds") {
      // For client SPOCs, only show CLIENT role users
      return { role: { eq: UserRole.CLIENT } };
    } else {
      // For HeadsUp SPOCs and Interviewers, exclude CLIENT role
      return { role: { ne: UserRole.CLIENT } };
    }
  }, [fieldName]);

  const { data: usersData, isLoading: isLoadingUsers } = useSearchUsers({
    limit: 100,
    // @ts-expect-error - searchFilter type mismatch with useSearchUsers
    search: searchFilter,
  });

  // Convert currentUsers to PopulatedUser array
  const populatedUsers: PopulatedUser[] = useMemo(() => {
    if (!currentUsers || currentUsers.length === 0) return [];

    // Check if already populated
    if (typeof currentUsers[0] === "object") {
      return currentUsers as PopulatedUser[];
    }

    return [];
  }, [currentUsers]);

  // Convert users to Options for multiselect
  const allUserOptions: Option[] = useMemo(() => {
    if (!usersData?.data) return [];

    return usersData.data.map((user: User) => ({
      value: user._id,
      label: `${user.firstName} ${user.lastName} (${user.email})`,
    }));
  }, [usersData]);

  // Currently selected users as Options
  const [selectedUsers, setSelectedUsers] = useState<Option[]>([]);

  // Initialize selected users from currentUsers
  useEffect(() => {
    if (populatedUsers.length > 0) {
      const selected = populatedUsers.map((user) => ({
        value: user._id,
        label: `${user.firstName} ${user.lastName} (${user.email})`,
      }));
      setSelectedUsers(selected);
    }
  }, [populatedUsers]);

  // Check if form is dirty
  const isDirty = useMemo(() => {
    const currentIds = populatedUsers.map((u) => u._id).sort();
    const selectedIds = selectedUsers.map((u) => u.value).sort();

    if (currentIds.length !== selectedIds.length) return true;

    return currentIds.some((id, index) => id !== selectedIds[index]);
  }, [populatedUsers, selectedUsers]);

  const handleSave = () => {
    const userIds = selectedUsers.map((user) => user.value);

    updateProject(
      {
        id: projectId,
        [fieldName]: userIds,
      },
      {
        onSuccess: () => {
          toast.success(`${title} updated successfully!`);
        },
        onError: (error) => {
          toast.error(`Failed to update ${title.toLowerCase()}`, {
            description:
              error instanceof Error ? error.message : "An error occurred",
          });
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Multi-select for users */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Assign Users</label>
            {isLoadingUsers ? (
              <div className="p-4 text-center text-sm text-muted-foreground border rounded-md">
                Loading users...
              </div>
            ) : (
              <MultipleSelector
                value={selectedUsers}
                onChange={setSelectedUsers}
                defaultOptions={allUserOptions}
                options={allUserOptions}
                placeholder="Select users..."
                emptyIndicator={
                  <p className="text-center text-sm text-muted-foreground">
                    No users found
                  </p>
                }
                hidePlaceholderWhenSelected
                creatable={false}
              />
            )}
          </div>

          {/* Debug info */}
          <div className="text-xs text-muted-foreground">
            Total users loaded: {allUserOptions.length} | Currently selected:{" "}
            {selectedUsers.length}
          </div>

          {/* Save Button */}
          {isDirty && (
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSave}
                className="w-32"
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Currently Assigned Users */}
      {populatedUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Currently Assigned ({populatedUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {populatedUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {user.firstName.charAt(0)}
                        {user.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {user.firstName} {user.lastName}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">Assigned</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {populatedUsers.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-2">
              <UserIcon className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="font-medium">No users assigned</h3>
              <p className="text-sm text-muted-foreground">
                Use the selector above to assign users to this project
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
