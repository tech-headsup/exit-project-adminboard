"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useInviteUser, useUpdateUser } from "@/hooks/useUsers";
import { User, UserRole } from "@/types/userTypes";
import { useAuthContext } from "@/contexts/AuthContext";
import UsersTableComponent from "@/components/UsersComponents/UsersTableComponent";

// Invite User Schema
const inviteUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(UserRole),
});

type InviteUserFormData = z.infer<typeof inviteUserSchema>;

// Edit User Schema
const editUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

export default function UserManagementPage() {
  const { user: currentUser } = useAuthContext();

  // Modals state
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const inviteUserMutation = useInviteUser();
  const updateUserMutation = useUpdateUser();

  // Invite user form
  const inviteForm = useForm<InviteUserFormData>({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      role: UserRole.EXECUTIVE,
    },
  });

  // Edit user form
  const editForm = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
  });

  // Handle row click to edit user
  const handleRowClick = (user: User) => {
    setSelectedUser(user);
    editForm.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
    });
    setEditModalOpen(true);
  };

  // Handle invite user submit
  const onInviteSubmit = async (data: InviteUserFormData) => {
    try {
      await inviteUserMutation.mutateAsync(data);
      toast.success("User invited successfully");
      setInviteModalOpen(false);
      inviteForm.reset();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to invite user");
    }
  };

  // Handle edit user submit
  const onEditSubmit = async (data: EditUserFormData) => {
    if (!selectedUser) return;

    try {
      await updateUserMutation.mutateAsync({
        userId: selectedUser._id,
        updateData: data,
      });
      toast.success("User updated successfully");
      setEditModalOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to update user");
    }
  };

  const isSuperAdmin = currentUser?.role === UserRole.SUPERADMIN;

  return (
    <div className="m-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground">
          Manage users and their permissions
        </p>
      </div>

      {/* Users Table with Filters */}
      <UsersTableComponent
        onInviteUser={() => setInviteModalOpen(true)}
        onRowClick={handleRowClick}
        canInvite={isSuperAdmin}
      />

      {/* Invite User Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite User</DialogTitle>
            <DialogDescription>
              Send an invitation to a new user. They will receive an email with
              login instructions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={inviteForm.handleSubmit(onInviteSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  {...inviteForm.register("email")}
                />
                {inviteForm.formState.errors.email && (
                  <p className="text-destructive text-sm">
                    {inviteForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={inviteForm.watch("role")}
                  onValueChange={(value) =>
                    inviteForm.setValue("role", value as UserRole)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                    <SelectItem value={UserRole.EXECUTIVE}>Executive</SelectItem>
                    <SelectItem value={UserRole.CLIENT}>Client</SelectItem>
                  </SelectContent>
                </Select>
                {inviteForm.formState.errors.role && (
                  <p className="text-destructive text-sm">
                    {inviteForm.formState.errors.role.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setInviteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={inviteUserMutation.isPending}>
                {inviteUserMutation.isPending ? "Inviting..." : "Invite"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(onEditSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  {...editForm.register("firstName")}
                />
                {editForm.formState.errors.firstName && (
                  <p className="text-destructive text-sm">
                    {editForm.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  {...editForm.register("lastName")}
                />
                {editForm.formState.errors.lastName && (
                  <p className="text-destructive text-sm">
                    {editForm.formState.errors.lastName.message}
                  </p>
                )}
              </div>
              {isSuperAdmin && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="editRole">Role</Label>
                    <Select
                      value={editForm.watch("role")}
                      onValueChange={(value) =>
                        editForm.setValue("role", value as UserRole)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UserRole.SUPERADMIN}>
                          Superadmin
                        </SelectItem>
                        <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                        <SelectItem value={UserRole.EXECUTIVE}>
                          Executive
                        </SelectItem>
                        <SelectItem value={UserRole.CLIENT}>Client</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="isActive">Status</Label>
                    <Select
                      value={editForm.watch("isActive")?.toString()}
                      onValueChange={(value) =>
                        editForm.setValue("isActive", value === "true")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive (Blocked)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
