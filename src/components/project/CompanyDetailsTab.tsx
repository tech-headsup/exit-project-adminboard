import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Project, PopulatedCompany } from "@/types/projectTypes";
import {
  Building2,
  Mail,
  Globe,
  Phone,
  Briefcase,
  Palette,
} from "lucide-react";
import { API_BASE_URL, API_ENDPOINTS } from "@/constant/apiEnpoints";

interface CompanyDetailsTabProps {
  project: Project;
}

export function CompanyDetailsTab({ project }: CompanyDetailsTabProps) {
  const company =
    typeof project.companyId === "object"
      ? (project.companyId as PopulatedCompany)
      : null;

  if (!company) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Company information not available
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Company Logo */}
          <div className="flex items-center gap-4">
            {company.companyLogo ? (
              <img
                src={`${API_BASE_URL}${API_ENDPOINTS.STORAGE_BUCKET.RETRIEVE_PUBLIC}/${company.companyLogo}`}
                alt={company.nameOfCompany}
                className="h-32 w-32 rounded object-cover border-0"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded bg-muted border">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div>
              <h3 className="text-2xl font-semibold">
                {company.nameOfCompany}
              </h3>
              <Badge variant="outline" className="mt-1">
                {company.industry}
              </Badge>
            </div>
          </div>

          {/* Company Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p className="text-sm">{company.companyEmail}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Contact Number
                  </p>
                  <p className="text-sm">
                    {company.companyContactNo || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Company Size
                  </p>
                  <p className="text-sm">
                    {company.companySize || "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Website
                  </p>
                  {company.companyWebsiteURL ? (
                    <a
                      href={company.companyWebsiteURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {company.companyWebsiteURL}
                    </a>
                  ) : (
                    <p className="text-sm">Not provided</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Palette className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Theme Color
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="h-6 w-6 rounded border"
                      style={{
                        backgroundColor: company.companyThemeColor || "#000000",
                      }}
                    />
                    <p className="text-sm font-mono">
                      {company.companyThemeColor || "#000000"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
