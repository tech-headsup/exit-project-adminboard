import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Separator } from "./ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import { Toaster } from "@/components/ui/sonner";
import { useAuthContext } from "@/contexts/AuthContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthContext();
  const [mounted, setMounted] = useState(false);

  // Pages that don't require authentication
  const publicPages = ["/login"];
  const isPublicPage = publicPages.includes(router.pathname);

  // Pages that should not show sidebar
  const noSidebarPages = ["/login", "/complete-profile"];
  const showSidebar = !noSidebarPages.includes(router.pathname);

  // Set mounted on client side only
  useEffect(() => {
    setMounted(true);
  }, []);

  // Protection logic
  useEffect(() => {
    if (!mounted || isLoading) return;

    // 1. No token - redirect to login (except on public pages)
    if (!isAuthenticated && !isPublicPage) {
      router.push("/login");
      return;
    }

    // 2. Has token but requires profile completion
    if (isAuthenticated && user?.requiresProfileCompletion) {
      // Only allow /complete-profile page
      if (router.pathname !== "/complete-profile") {
        router.push("/complete-profile");
      }
      return;
    }

    // 3. Profile complete - don't allow /complete-profile
    if (isAuthenticated && !user?.requiresProfileCompletion && router.pathname === "/complete-profile") {
      router.push("/");
      return;
    }
  }, [mounted, isAuthenticated, isLoading, user, router, isPublicPage]);

  // Show loading while checking auth (client-side only)
  if (mounted && (isLoading || (!isAuthenticated && !isPublicPage))) {
    return (
      <>
        <div className="flex h-screen w-full items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
        <Toaster />
      </>
    );
  }

  // If no sidebar, just render children with toaster
  if (!showSidebar) {
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            {/* <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb> */}
          </div>
        </header>
        {children}
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}
