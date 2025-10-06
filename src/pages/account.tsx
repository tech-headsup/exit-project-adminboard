"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuthContext } from "@/contexts/AuthContext";
import { useUpdateUser, useSearchUserById } from "@/hooks/useUsers";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { UserRole } from "@/types/userTypes";

// Update Profile Schema
const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

export default function AccountPage() {
  const { user: currentUser, setUser } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch full user details
  const { data: userDetailsData, isLoading } = useSearchUserById(
    currentUser?._id || "",
    !!currentUser?._id
  );

  const updateUserMutation = useUpdateUser();

  // Get the first user from the array (since search returns array)
  const userDetails = userDetailsData?.data?.[0];

  // Form
  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    values: {
      firstName: userDetails?.firstName || "",
      lastName: userDetails?.lastName || "",
    },
  });

  const onSubmit = async (data: UpdateProfileFormData) => {
    if (!currentUser?._id) return;

    try {
      await updateUserMutation.mutateAsync({
        userId: currentUser._id,
        updateData: data,
      });

      // Update user in context
      if (currentUser) {
        setUser({
          ...currentUser,
          firstName: data.firstName,
          lastName: data.lastName,
        });
      }

      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update profile");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">User not found</div>
      </div>
    );
  }

  const roleColors = {
    [UserRole.SUPERADMIN]:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    [UserRole.ADMIN]:
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    [UserRole.EXECUTIVE]:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    [UserRole.CLIENT]:
      "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  };

  return (
    <div className="m-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    disabled={!isEditing}
                    {...form.register("firstName")}
                  />
                  {form.formState.errors.firstName && (
                    <p className="text-destructive text-sm">
                      {form.formState.errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    disabled={!isEditing}
                    {...form.register("lastName")}
                  />
                  {form.formState.errors.lastName && (
                    <p className="text-destructive text-sm">
                      {form.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {!isEditing ? (
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      type="submit"
                      disabled={updateUserMutation.isPending}
                    >
                      {updateUserMutation.isPending
                        ? "Saving..."
                        : "Save Changes"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        form.reset();
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account Details (Read-only) */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>
              Your account information and status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-medium">{userDetails.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Role</Label>
                <div className="mt-1">
                  <Badge
                    className={roleColors[userDetails.role]}
                    variant="secondary"
                  >
                    {userDetails.role}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Account Status</Label>
                <div className="mt-1">
                  <Badge
                    variant={userDetails.isActive ? "isActive" : "notActive"}
                  >
                    {userDetails.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Email Verified</Label>
                <div className="mt-1">
                  <Badge
                    variant={
                      userDetails.isEmailVerified ? "isVerified" : "default"
                    }
                  >
                    {userDetails.isEmailVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Account Type</Label>
                <div className="mt-1">
                  <Badge variant="outline">
                    {userDetails.isInvited ? "Invited" : "Registered"}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Login Type</Label>
                <p className="font-medium capitalize">
                  {userDetails.loginType?.replace("_", " ") || "N/A"}
                </p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-muted-foreground">Member Since</Label>
                <p className="font-medium">
                  {userDetails.createdAt
                    ? new Date(userDetails.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "N/A"}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Last Login</Label>
                <p className="font-medium">
                  {userDetails.lastLogin
                    ? formatDistanceToNow(new Date(userDetails.lastLogin), {
                        addSuffix: true,
                      })
                    : "Never"}
                </p>
              </div>
              {userDetails.invitedBy &&
                typeof userDetails.invitedBy === "object" && (
                  <div>
                    <Label className="text-muted-foreground">Invited By</Label>
                    <p className="font-medium">
                      {userDetails.invitedBy.firstName}{" "}
                      {userDetails.invitedBy.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {userDetails.invitedBy.email}
                    </p>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
