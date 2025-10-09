"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import { useProjectById } from "@/hooks/useProject";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { CompanyDetailsTab } from "@/components/project/CompanyDetailsTab";
import { ProjectDetailsTab } from "@/components/project/ProjectDetailsTab";
import { UserAssignmentTab } from "@/components/project/UserAssignmentTab";

export default function ProjectDetails() {
  const router = useRouter();
  const projectId = router.query.id as string;

  console.log("projectId---", projectId);

  // Fetch project data
  const { data: projectData, isLoading, error } = useProjectById(projectId);

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-8">
        <h1 className="text-2xl font-bold">Loading Project Details...</h1>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-6 px-8">
        <h1 className="text-2xl font-bold text-red-600">
          Error Loading Project
        </h1>
        <p className="text-muted-foreground mt-2">
          {error instanceof Error
            ? error.message
            : "Failed to load project details"}
        </p>
      </div>
    );
  }

  // No data state
  if (!projectData?.data) {
    return (
      <div className="container mx-auto py-6 px-8">
        <h1 className="text-2xl font-bold">Project Not Found</h1>
      </div>
    );
  }

  const project = projectData.data;

  return (
    <div className="container mx-auto py-6 px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {project.projectName}
          </h1>
          <p className="text-muted-foreground mt-2">
            View and manage project details
          </p>
        </div>
        <Button
          onClick={() => router.push(`/projects/${projectId}/candidates`)}
          variant="default"
        >
          <Users className="-ms-1 me-2 opacity-60" size={16} />
          View Candidates
        </Button>
      </div>

      <Tabs defaultValue="company" className="w-full">
        <TabsList className="h-auto rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="company"
            className="data-[state=active]:after:bg-primary relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Company Details
          </TabsTrigger>
          <TabsTrigger
            value="project"
            className="data-[state=active]:after:bg-primary relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Project Details
          </TabsTrigger>
          <TabsTrigger
            value="headsup"
            className="data-[state=active]:after:bg-primary relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            HeadsUp SPOCs
          </TabsTrigger>
          <TabsTrigger
            value="client"
            className="data-[state=active]:after:bg-primary relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Client SPOCs
          </TabsTrigger>
          <TabsTrigger
            value="interviewers"
            className="data-[state=active]:after:bg-primary relative rounded-none py-2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Interviewers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-6">
          <CompanyDetailsTab project={project} />
        </TabsContent>

        <TabsContent value="project" className="mt-6">
          <ProjectDetailsTab project={project} />
        </TabsContent>

        <TabsContent value="headsup" className="mt-6">
          <UserAssignmentTab
            projectId={project._id}
            fieldName="headsUpSpocIds"
            title="HeadsUp SPOCs"
            description="Assign HeadsUp SPOC users to this project"
            currentUsers={project.headsUpSpocIds}
          />
        </TabsContent>

        <TabsContent value="client" className="mt-6">
          <UserAssignmentTab
            projectId={project._id}
            fieldName="clientSpocIds"
            title="Client SPOCs"
            description="Assign Client SPOC users to this project"
            currentUsers={project.clientSpocIds}
          />
        </TabsContent>

        <TabsContent value="interviewers" className="mt-6">
          <UserAssignmentTab
            projectId={project._id}
            fieldName="interviewerIds"
            title="Interviewers"
            description="Assign interviewer users to this project"
            currentUsers={project.interviewerIds}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
