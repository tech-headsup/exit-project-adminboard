import { GetCompaniesRequest } from "@/types/companyTypes";
import { SearchUsersRequest } from "@/types/userTypes";
import { GetProjectsRequest, GetProjectsByCompanyRequest } from "@/types/projectTypes";
import { GetCandidatesRequest } from "@/types/candidateTypes";
import { GetQuestionnairesRequest, GetGlobalTemplatesRequest } from "@/types/questionnaireTypes";
import { GetAnswersByCandidateRequest, GetAnswersByProjectRequest } from "@/types/answerTypes";

export const queryKeys = {
  // User keys
  users: {
    all: ["users"] as const,
    search: (params: SearchUsersRequest) => ["users", "search", params] as const,
    searchById: (userId: string) => ["users", "searchById", userId] as const,
  },

  // Company keys
  companies: {
    all: ["companies"],
    search: (params: GetCompaniesRequest) => ["companies", "search", params],
    searchById: (companyId: string) => ["companies", "searchById", companyId],
    create: () => ["companies", "create"],
    update: (companyId: string) => ["companies", "update", companyId],
    delete: (companyId: string) => ["companies", "delete", companyId],
  },

  // Project keys
  projects: {
    all: ["projects"] as const,
    list: (params?: GetProjectsRequest) => ["projects", "list", params] as const,
    detail: (id: string) => ["projects", "detail", id] as const,
    byCompany: (params: GetProjectsByCompanyRequest) => ["projects", "company", params] as const,
    readiness: (id: string) => ["projects", "readiness", id] as const,
  },

  // Candidate keys
  candidates: {
    all: ["candidates"] as const,
    list: (params?: GetCandidatesRequest) => ["candidates", "list", params] as const,
    detail: (id: string) => ["candidates", "detail", id] as const,
  },

  // Questionnaire keys
  questionnaires: {
    all: ["questionnaires"] as const,
    list: (params?: GetQuestionnairesRequest) => ["questionnaires", "list", params] as const,
    detail: (id: string) => ["questionnaires", "detail", id] as const,
    globalTemplates: (params?: GetGlobalTemplatesRequest) => ["questionnaires", "global-templates", params] as const,
  },

  // Answer keys
  answers: {
    all: ["answers"] as const,
    byCandidate: (params: GetAnswersByCandidateRequest) => ["answers", "candidate", params] as const,
    byProject: (params: GetAnswersByProjectRequest) => ["answers", "project", params] as const,
  },

  // AI Report keys
  aiReports: {
    all: ["aiReports"] as const,
    status: (candidateId: string) => ["aiReports", "status", candidateId] as const,
    byCandidate: (candidateId: string) => ["aiReports", "candidate", candidateId] as const,
  },
};
