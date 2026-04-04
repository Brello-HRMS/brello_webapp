import { SortOrder } from '../../../types/common';

// Re-export enums so existing consumers don't need to change their imports
export { ProjectStatus, ProjectPriority, ProjectType } from './projectEnums';

import type { ProjectStatus, ProjectPriority, ProjectType } from './projectEnums';

// ---------------------------------------------------------------------------
// Shared / reusable entity interfaces
// ---------------------------------------------------------------------------

export interface ProjectClient {
  id: string;
  enterprise_id: string | null;
  organization_id: string;
  status: string;
  code: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  modified_by: string | null;
  modified_at: string | null;
  deleted_by: string | null;
  deleted_at: string | null;
  name: string;
  poc_name: string;
  poc_email: string;
  poc_phone: string;
  address: string;
  logo: string | null;
}

export interface ProjectUser {
  id: string;
  enterprise_id: string | null;
  organization_id: string;
  status: string;
  code: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  modified_by: string | null;
  modified_at: string | null;
  deleted_by: string | null;
  deleted_at: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email: string;
  phone: string;
  is_platform_admin: boolean;
  reports_to_id: string | null;
  department_id: string | null;
  designation_id: string | null;
  user_profile_id: string | null;
  plan_id: string | null;
  last_access_app_id: string | null;
  avatar?: string | null;
}

// ---------------------------------------------------------------------------
// Project team
// ---------------------------------------------------------------------------

/** Payload shape when assigning a member during project creation */
export interface ProjectTeamMember {
  user_id: string;
  role: string;
  is_lead?: boolean;
}

export interface ProjectTeamMemberDetail {
  id: string;
  project_id: string;
  user_id: string;
  user: ProjectUser;
  role: string;
  is_lead?: boolean;
  assigned_at: string;
  assigned_by: string;
}

// ---------------------------------------------------------------------------
// Project contract
// ---------------------------------------------------------------------------

export interface ProjectContract {
  name: string;
  file: File;
}

export interface ProjectContractDetail {
  id: string;
  project_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  uploaded_at: string;
  uploaded_by: string;
  document_id: string | null;
}

export interface GetProjectContractsResponse {
  success: boolean;
  data: ProjectContractDetail[];
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Project
// ---------------------------------------------------------------------------

export interface Project {
  id: string;
  enterprise_id: string | null;
  organization_id: string;
  status: string;
  code: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  modified_by: string | null;
  modified_at: string | null;
  deleted_by: string | null;
  deleted_at: string | null;
  client_id: string;
  client?: ProjectClient;
  name: string;
  project_type: ProjectType;
  project_status: ProjectStatus;
  priority: ProjectPriority;
  start_date: string | null;
  end_date: string | null;
  contracts?: { id: string; name: string; url: string }[];
  team?: ProjectTeamMemberDetail[];
}

// ---------------------------------------------------------------------------
// API params & responses
// ---------------------------------------------------------------------------

export interface CreateProjectParams {
  name: string;
  project_type: ProjectType;
  project_status: ProjectStatus;
  priority: ProjectPriority;
  start_date?: string | null;
  end_date?: string | null;
  description?: string;
  team?: ProjectTeamMember[];
  contracts?: {
    name: string;
    file: unknown;
    documentId?: string;
  }[];
}

export interface GetProjectResponse {
  success: boolean;
  data: Project;
  timestamp: string;
}

export interface GetProjectsResponse {
  success: boolean;
  data: {
    data: Project[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  timestamp: string;
}

export interface GetProjectsParams {
  client_id?: string;
  status?: ProjectStatus;
  sort_by?: string;
  sort_order?: SortOrder;
  page?: number;
  limit?: number;
  search?: string;
}

export interface AddTeamMembersParams {
  members: {
    user_id: string;
    role: string;
    is_lead?: boolean;
  }[];
}

export interface GetProjectTeamResponse {
  success: boolean;
  data: ProjectTeamMemberDetail[];
  timestamp: string;
}
