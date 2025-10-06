import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
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
import { Badge } from "@/components/ui/badge";
import { useUpdateProject } from "@/hooks/useProject";
import { Project, ProjectType, ProjectStatus } from "@/types/projectTypes";
import { CalendarIcon } from "lucide-react";

interface ProjectDetailsTabProps {
  project: Project;
}

// Inline Zod schema
const projectDetailsSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  projectType: z.nativeEnum(ProjectType),
  projectStatus: z.nativeEnum(ProjectStatus),
  noOfEmployees: z.number().min(1, "Must have at least 1 employee"),
});

type ProjectDetailsFormValues = z.infer<typeof projectDetailsSchema>;

export function ProjectDetailsTab({ project }: ProjectDetailsTabProps) {
  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject();

  const form = useForm<ProjectDetailsFormValues>({
    resolver: zodResolver(projectDetailsSchema),
    mode: "onChange",
    defaultValues: {
      projectName: project.projectName,
      projectType: project.projectType,
      projectStatus: project.projectStatus,
      noOfEmployees: project.noOfEmployees,
    },
  });

  const {
    formState: { isDirty },
  } = form;

  // Reset form when project data changes
  useEffect(() => {
    form.reset({
      projectName: project.projectName,
      projectType: project.projectType,
      projectStatus: project.projectStatus,
      noOfEmployees: project.noOfEmployees,
    });
  }, [project, form]);

  const onSubmit = (data: ProjectDetailsFormValues) => {
    updateProject(
      {
        id: project._id,
        projectName: data.projectName,
        projectType: data.projectType,
        noOfEmployees: data.noOfEmployees,
      },
      {
        onSuccess: () => {
          toast.success("Project updated successfully!");
          form.reset(data); // Reset dirty state
        },
        onError: (error) => {
          toast.error("Failed to update project", {
            description: error instanceof Error ? error.message : "An error occurred",
          });
        },
      }
    );
  };

  // Update status separately
  const handleStatusChange = (newStatus: ProjectStatus) => {
    updateProject(
      {
        id: project._id,
        projectStatus: newStatus,
      },
      {
        onSuccess: () => {
          toast.success("Project status updated successfully!");
          form.setValue("projectStatus", newStatus, { shouldDirty: false });
        },
        onError: (error) => {
          toast.error("Failed to update project status", {
            description: error instanceof Error ? error.message : "An error occurred",
          });
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project Name */}
                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter project name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Project Type */}
                <FormField
                  control={form.control}
                  name="projectType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project type" />
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

                {/* Number of Employees */}
                <FormField
                  control={form.control}
                  name="noOfEmployees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Employees</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          placeholder="Enter number of employees"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Project Status - Separate update */}
                <FormField
                  control={form.control}
                  name="projectStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Status</FormLabel>
                      <Select
                        onValueChange={(value) => handleStatusChange(value as ProjectStatus)}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={ProjectStatus.PLANNING}>
                            Planning
                          </SelectItem>
                          <SelectItem value={ProjectStatus.IN_PROGRESS}>
                            In Progress
                          </SelectItem>
                          <SelectItem value={ProjectStatus.COMPLETED}>
                            Completed
                          </SelectItem>
                          <SelectItem value={ProjectStatus.ON_HOLD}>
                            On Hold
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Read-only fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span className="font-medium">Created Date</span>
                  </div>
                  <p className="text-sm">
                    {format(new Date(project.createdAt), "PPP 'at' p")}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span className="font-medium">Last Updated</span>
                  </div>
                  <p className="text-sm">
                    {format(new Date(project.updatedAt), "PPP 'at' p")}
                  </p>
                </div>
              </div>

              {/* Save Button */}
              {isDirty && (
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    className="w-32"
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Updating..." : "Update"}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Commented Delete Button */}
      {/* <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Delete Project</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete this project. This action cannot be undone.
              </p>
            </div>
            <Button variant="destructive">Delete Project</Button>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
