export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/v1";

export const API_ENDPOINTS = {
  // User endpoints (all POST with data in req.body)
  USERS: {
    REGISTER: "/users/register", // Body: { email, password, firstName, lastName, loginType, role, avatarURL? }
    LOGIN: "/users/login", // Body: { email, password }
    LOGOUT: "/users/logout", // Body: {} (empty)
    COMPLETE_PROFILE: "/users/complete-profile", // Body: { firstName, lastName, newPassword }
    CHANGE_PASSWORD: "/users/change-password", // Body: { currentPassword, newPassword }
    INVITE: "/users/invite", // Body: { email, role }
    SEARCH: "/users/search", // Body: { page?, limit?, search?: {} }
    SEARCH_BY_ID: "/users/search-by-id", // Body: { search: { _id } }
    UPDATE: "/users/update", // Body: { userId, updateData: { firstName?, lastName?, role?, ... } }
    DELETE: "/users/delete", // Body: { userId }
  },

  COMPANYS: {
    CREATE: "/company/create", // Body: { name, address?, phone?, website? etc.. }
    SEARCH: "/company/search", // Body: { page?, limit?, search?: {} }
    SEARCHBYID: "/company/searchById", // Body: { companyId }
    UPDATE: "/company/update", // Body: { companyId, updateData: { name?, address?, phone?, website?, ... } }
    DELETE: "/company/delete", // Body: { companyId }
  },

  STORAGE_BUCKET: {
    UPLOAD: "/storage/upload", // FormData: { file: File }
    RETRIEVE_PUBLIC: "/storage/retrieve/public", // Body: { fileKey }
  },

  // Project endpoints (all POST with data in req.body)
  PROJECTS: {
    CREATE: "/project/create", // Body: { companyId, projectName, projectType, noOfEmployees, questionnaireId?, headsUpSpocIds?, clientSpocIds?, interviewerIds? }
    GET: "/project/search", // Body: { id } OR { page?, limit?, search?, sort? }
    GET_BY_ID: "/project/search-by-id", // Body: { id }
    GET_BY_COMPANY: "/project/search-by-id", // Body: { companyId, page?, limit?, projectStatus? }
    UPDATE: "/project/update", // Body: { id, projectName?, projectType?, noOfEmployees?, questionnaireId?, headsUpSpocIds?, clientSpocIds?, interviewerIds? }
    DELETE: "/project/delete", // Body: { id }
    UPDATE_STATUS: "/project/update-status", // Body: { id, projectStatus }
    CHECK_READINESS: "/project/check-readiness", // Body: { id }
    ASSIGN_USERS: "/project/assign-users", // Body: { id, headsUpSpocIds?, clientSpocIds?, interviewerIds? }
  },

  // Candidate endpoints (all POST with data in req.body)
  CANDIDATES: {
    UPLOAD_EXCEL: "/candidate/upload-excel", // Body: { projectId, uploadedBy, candidates: [...] }
    GET: "/candidate/search", // Body: { page?, limit?, search?, sort? }
    GET_BY_ID: "/candidate/search-by-id", // Body: { id }
    DELETE: "/candidate/delete", // Body: { id, hardDelete? }
    ASSIGN_INTERVIEWER: "/candidate/assign-interviewer", // Body: { candidateIds, interviewerId, assignedBy }
    AUTO_ASSIGN_INTERVIEWERS: "/candidate/auto-assign-interviewers", // Body: { projectId, interviewerIds, assignedBy }
    UPDATE_FOLLOWUP: "/candidate/update-followup", // Body: { candidateId, attemptNumber, callStatus, notes?, scheduledInterviewDate?, attemptedBy }
    UPDATE_INTERVIEW_DETAILS: "/candidate/update-interview-details", // Body: { candidateId, scheduledDate?, startedAt?, completedAt?, interviewDurationMinutes?, questionnaireId?, answersSubmitted? }
    UPDATE_STATUS: "/candidate/update-status", // Body: { candidateId, overallStatus }
  },

  // questionnaires endpoints (all POST with data in req.body)
  QUESTIONNAIRES: {
    CREATE: "/questionnaire/create", // Body: { name, description?, isDefault?, themes: [...], createdBy }
    SEARCH: "/questionnaire/search", // Body: { page?, limit?, search?: { isDefault?, isActive?, createdBy?, name? }, sort? }
    SEARCH_BY_ID: "/questionnaire/search-by-id", // Body: { id }
    UPDATE: "/questionnaire/update", // Body: { id, name?, description?, isDefault?, themes? }
    DELETE: "/questionnaire/delete", // Body: { id, hardDelete? }
    DUPLICATE: "/questionnaire/duplicate", // Body: { id, name, createdBy }
  },

  // Answer endpoints (all POST with data in req.body)
  ANSWERS: {
    SUBMIT_INTERVIEW: "/answer/submit-interview-answers", // Body: { candidateId, projectId, questionnaireId, answers: [...], submittedBy, completedAt, interviewDurationMinutes }
    SUBMIT_BULK: "/answer/submit-bulk", // Body: { candidateId, projectId, questionnaireId, answers: [...], submittedBy }
    GET_BY_CANDIDATE: "/answer/get-by-candidate", // Body: { candidateId, themeId? }
    GET_BY_PROJECT: "/answer/get-by-project", // Body: { projectId, page?, limit?, themeId? }
    SEARCH_BY_ID: "/answer/search-by-id", // Body: { id }
    UPDATE: "/answer/update", // Body: { id, answer?, notes? }
    DELETE: "/answer/delete", // Body: { id, hardDelete? }
  },
};
