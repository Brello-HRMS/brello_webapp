import { SortOrder } from '../../../types/common';

export const ProjectStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  ON_HOLD: 'ON_HOLD',
  COMPLETED: 'COMPLETED',
  IN_PROGRESS: 'IN_PROGRESS',
} as const;
export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const ProjectPriority = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
  URGENT: 'URGENT',
} as const;
export type ProjectPriority = (typeof ProjectPriority)[keyof typeof ProjectPriority];

export interface ProjectTeamMember {
  employee_id: string;
  role: string;
}

export interface ProjectContract {
  name: string;
  file: File;
}

export const ProjectType = {
  INTERNAL: 'INTERNAL',
  CLIENT: 'CLIENT',
  FIXED_PRICE: 'FIXED_PRICE',
  TM: 'TM',
  AGILE: 'AGILE',
} as const;
export type ProjectType = (typeof ProjectType)[keyof typeof ProjectType];

export interface Project {
  id: string;
  name: string;
  project_type: ProjectType;
  project_status: ProjectStatus;
  priority: ProjectPriority;
  start_date?: string;
  end_date?: string;
  description?: string;
  last_updated: string;
  client_id: string;
  lead_id?: string;
  team?: ProjectTeamMember[];
}

export interface CreateProjectParams {
  name: string;
  project_type: ProjectType;
  project_status: ProjectStatus;
  priority: ProjectPriority;
  start_date?: string | null;
  end_date?: string | null;
  description?: string;
  lead_id?: string;
  team?: ProjectTeamMember[];
  contracts?: unknown[];
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
  }[];
}

export interface ProjectTeamMemberDetail {
  id: string;
  project_id: string;
  user_id: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    status: string;
  };
  role: string;
  assigned_at: string;
  assigned_by: string;
}

export interface GetProjectTeamResponse {
  success: boolean;
  data: ProjectTeamMemberDetail[];
  timestamp: string;
}
