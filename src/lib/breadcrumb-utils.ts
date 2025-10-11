import { useRouter } from "next/router";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function useBreadcrumbs(): BreadcrumbItem[] {
  const router = useRouter();
  const { pathname, query } = router;

  // Generate breadcrumbs based on pathname
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [
      { label: "Dashboard", href: "/" },
    ];

    // Split pathname and filter out empty strings
    const pathSegments = pathname.split("/").filter((segment) => segment);

    // Handle different routes
    if (pathSegments.length === 0) {
      // We're on the home page
      return [{ label: "Dashboard" }];
    }

    // Build breadcrumbs based on segments
    let currentPath = "";

    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;

      // Skip dynamic route segments in breadcrumb path
      if (segment.startsWith("[") && segment.endsWith("]")) {
        // For dynamic segments, use the actual value from query
        const paramName = segment.slice(1, -1); // Remove [ and ]
        const paramValue = query[paramName];

        if (paramValue) {
          breadcrumbs.push({
            label: formatLabel(paramValue as string),
            href: index === pathSegments.length - 1 ? undefined : currentPath.replace(`[${paramName}]`, paramValue as string),
          });
        }
        return;
      }

      // Format the segment label
      const label = formatLabel(segment);

      // Last segment should not have href (current page)
      const isLast = index === pathSegments.length - 1;

      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
      });
    });

    return breadcrumbs;
  };

  return generateBreadcrumbs();
}

// Helper function to format segment labels
function formatLabel(segment: string): string {
  // Replace hyphens with spaces
  const withSpaces = segment.replace(/-/g, " ");

  // Capitalize first letter of each word
  return withSpaces
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
