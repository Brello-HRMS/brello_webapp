import { SortOrder } from '../../../types/common';

export type ProjectStatus = 'DRAFT' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
export type ProjectPriority = 'High' | 'Medium' | 'Low';

export interface ProjectTeamMember {
  employee_id: string;
  role: string;
}

export interface Project {
  id: string;
  name: string;
  type: string;
  status: ProjectStatus;
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
  type: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date?: string;
  end_date?: string;
  description?: string;
  client_id: string;
  lead_id?: string;
  team?: ProjectTeamMember[];
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
