import { Control } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserMultiSelect } from "@/components/project/UserMultiSelect";
import { TeamAssignmentValues } from "@/lib/project-form-schema";
import { UserRole } from "@/types/userTypes";
import { Users, UserCheck, Building2 } from "lucide-react";

interface TeamAssignmentProps {
  control: Control<TeamAssignmentValues>;
}

export function TeamAssignment({ control }: TeamAssignmentProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <CardTitle>Assign Project Team</CardTitle>
        </div>
        <CardDescription>
          Select team members who will be involved in this project
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Heads-Up SPOC */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-blue-600" />
            <h3 className="text-sm font-semibold">Heads-Up SPOC *</h3>
          </div>
          <UserMultiSelect
            control={control}
            name="headsUpSpocIds"
            label=""
            title=""
            cardDescription=""
            roleFilter="NON_CLIENT"
            description="Select admin or executive users who will be notified about project updates"
            hideCard={true}
          />
        </div>

        {/* Client SPOC */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-green-600" />
            <h3 className="text-sm font-semibold">
              Client SPOC <span className="text-gray-400">(Optional)</span>
            </h3>
          </div>
          <UserMultiSelect
            control={control}
            name="clientSpocIds"
            label=""
            title=""
            cardDescription=""
            roleFilter={UserRole.CLIENT}
            description="Select client users who will be the point of contact for this project"
            hideCard={true}
          />
        </div>

        {/* Interviewers */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-600" />
            <h3 className="text-sm font-semibold">Interviewers *</h3>
          </div>
          <UserMultiSelect
            control={control}
            name="interviewerIds"
            label=""
            title=""
            cardDescription=""
            roleFilter="NON_CLIENT"
            description="Select users who will conduct interviews for this project"
            hideCard={true}
          />
        </div>
      </CardContent>
    </Card>
  );
}
