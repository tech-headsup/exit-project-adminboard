// ==================== ENUMS ====================

export enum CompanySize {
  STARTUP = "STARTUP",
  SMALL = "SMALL",
  MEDIUM = "MEDIUM",
  LARGE = "LARGE",
  ENTERPRISE = "ENTERPRISE",
}

// ==================== BASE TYPES ====================

export interface BillingAddress {
  addressLine1: string;
  addressLine2?: string;
  addressLine3?: string;
  landmark?: string;
  country: string;
  city: string;
  state: string;
  pinCode: string;
}

export interface ClientPOC {
  _id: string;
  email: string;
  isActive?: boolean;
  name?: string;
}

export interface Company {
  _id: string;
  nameOfCompany: string;
  companySize: CompanySize;
  industry: string;
  companyWebsiteURL?: string;
  companyContactNo: string;
  companyEmail: string;
  companyLogo?: string;
  companyThemeColor: string;
  gstNumber?: string;
  billingAddress: BillingAddress;
  clientPOCs: string[] | ClientPOC[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// ==================== PAGINATION ====================

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ==================== API RESPONSE TYPES ====================

// Create Company Response - POST /api/company/create
export interface CreateCompanyResponse {
  success: true;
  message: string;
  data: Company;
}

// Get Companies Response - POST /api/company/get (or /company/search)
export interface GetCompaniesResponse {
  success: true;
  data: {
    companies: Company[];
    pagination: Pagination;
  };
}

// Get Company By ID Response - POST /api/company/getById (or /company/searchById)
export interface GetCompanyByIdResponse {
  success: true;
  data: Company;
}

// Update Company Response - POST /api/company/update
export interface UpdateCompanyResponse {
  success: true;
  message: string;
  data: Company;
}

// Delete Company Response - POST /api/company/delete
export interface DeleteCompanyResponse {
  success: true;
  message: string;
  data?: Company; // data is present for soft delete, absent for hard delete
}

// Error Response
export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
}

// ==================== REQUEST TYPES ====================

export interface CreateCompanyRequest {
  nameOfCompany: string;
  companySize: CompanySize;
  industry: string;
  companyWebsiteURL?: string;
  companyContactNo: string;
  companyEmail: string;
  companyLogo?: string;
  companyThemeColor?: string;
  gstNumber?: string;
  billingAddress: BillingAddress;
  clientPOCs?: string[];
}

// Search filter operators (Backend custom format)
export interface SearchOperators {
  eq?: any; // equals
  contains?: string; // contains substring
  in?: any[]; // in array
  gte?: string | number; // greater than or equal
  lte?: string | number; // less than or equal
  gt?: string | number; // greater than
  lt?: string | number; // less than
  startsWith?: string; // starts with
  endsWith?: string; // ends with
}

// Search filters - dynamic keys based on Company fields
export type SearchFilters = {
  [K in keyof Partial<Company>]?: SearchOperators;
};

// Sort options - 1 for ascending, -1 for descending, or "asc"/"desc"
export type SortOptions = {
  [K in keyof Partial<Company>]?: 1 | -1 | "asc" | "desc";
};

// Get Companies Request - POST /api/company/search
export interface GetCompaniesRequest {
  page?: number;
  limit?: number;
  search?: SearchFilters;
  sort?: SortOptions;
}

// Get Company By ID Request - POST /api/company/getById
export interface GetCompanyByIdRequest {
  id: string;
}

// Update Company Request - POST /api/company/update
export interface UpdateCompanyRequest {
  id: string;
  data: Partial<CreateCompanyRequest>;
}

// Delete Company Request - POST /api/company/delete
export interface DeleteCompanyRequest {
  id: string;
  hardDelete?: boolean;
}
