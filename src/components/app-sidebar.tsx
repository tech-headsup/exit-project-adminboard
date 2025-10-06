"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Building2,
  Command,
  Database,
  FileText,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Users,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuthContext } from "@/contexts/AuthContext";
import { UserRole } from "@/types/userTypes";

// This is sample data.
const data = {
  user: {
    name: "Anzar",
    email: "abc@an.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  // Management
  navMain: [
    {
      title: "Database",
      url: "#Database",
      icon: Database,
      isActive: true,
      items: [
        {
          title: "Exit Questionaire",
          url: "#Exit",
        },
        {
          title: "Stay Questionaire",
          url: "#Stay",
        },
        {
          title: "Offer For Dropouts",
          url: "#Offer",
        },
      ],
    },
    {
      title: "Reports",
      url: "#",
      icon: FileText,
      items: [
        {
          title: "Individual Reports",
          url: "#ind",
        },
        {
          title: "Consolidated Reports",
          url: "#con",
        },
      ],
    },
    {
      title: "User Management",
      url: "/user-management",
      icon: Users,
      // items: [
      //   {
      //     title: "All Users",
      //     url: "/user-management",
      //   },
      //   {
      //     title: "Headsup Management",
      //     url: "#",
      //   },
      //   {
      //     title: "Client Management",
      //     url: "#",
      //   },
      // ],
    },
  ],
  // Exit Section
  projects: [
    {
      name: "Dashboard",
      url: "/",
      icon: PieChart,
    },
    {
      name: "Companies",
      url: "/companies",
      icon: Building2,
    },
    {
      name: "Projects",
      url: "/projects",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthContext();

  // Check if user can manage users (admin or superadmin only)
  const canManageUsers =
    user?.role === UserRole.ADMIN || user?.role === UserRole.SUPERADMIN;

  // Filter navMain items based on user role
  const filteredNavMain = data.navMain.filter((item) => {
    if (item.title === "User Management") {
      return canManageUsers;
    }
    return true;
  });

  // Use user data from context if available
  const userData = user
    ? {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        avatar: user.avatarURL || "/avatars/shadcn.jpg",
      }
    : data.user;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.projects} />
        <NavMain items={filteredNavMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
