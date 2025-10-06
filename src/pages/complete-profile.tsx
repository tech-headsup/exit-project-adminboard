"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useCompleteProfile } from "@/hooks/useAuth";
import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { GalleryVerticalEnd } from "lucide-react";
import { useEffect } from "react";

const completeProfileSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type CompleteProfileFormData = z.infer<typeof completeProfileSchema>;

export default function CompleteProfilePage() {
  const router = useRouter();
  const { user, setUser, login } = useAuthContext();
  const completeProfileMutation = useCompleteProfile();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompleteProfileFormData>({
    resolver: zodResolver(completeProfileSchema),
  });

  // Redirect if user doesn't need profile completion
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // If profile is already completed, redirect to home
    if (user.requiresProfileCompletion === false) {
      router.push("/");
    }
  }, [user, router]);

  const onSubmit = async (data: CompleteProfileFormData) => {
    try {
      const response = await completeProfileMutation.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        newPassword: data.newPassword,
      });

      // If backend returns a fresh JWT token, use it to update auth
      if (response.data.token) {
        login(response.data.token);
      } else {
        // Fallback: manually update user state
        setUser({ ...response.data.user, requiresProfileCompletion: false });
      }

      toast.success("Profile completed successfully!");
      router.push("/");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to complete profile. Please try again."
      );
    }
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Acme Inc.
        </a>
        <div className="bg-card rounded-xl p-6 shadow-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <FieldGroup>
              <div className="flex flex-col items-center gap-1 text-center">
                <h1 className="text-2xl font-bold">Complete Your Profile</h1>
                <p className="text-muted-foreground text-sm text-balance">
                  Please set up your profile to continue
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.firstName.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.lastName.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
                <Input
                  id="newPassword"
                  type="password"
                  {...register("newPassword")}
                />
                {errors.newPassword && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.newPassword.message}
                  </p>
                )}
              </Field>
              <Field>
                <FieldLabel htmlFor="confirmPassword">
                  Confirm Password
                </FieldLabel>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </Field>
              <Field>
                <Button
                  type="submit"
                  disabled={completeProfileMutation.isPending}
                >
                  {completeProfileMutation.isPending
                    ? "Completing..."
                    : "Complete Profile"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </div>
      </div>
    </div>
  );
}
