import { Status, SortOrder } from '../../../types/common';

export type DepartmentStatus = Status;

export interface Department {
  id: string;
  enterprise_id: string | null;
  organization_id: string;
  status: DepartmentStatus;
  code: string;
  description: string;
  name: string;
  icon: string | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  modified_by: string;
  memberAvatars: string[];
  modified_at: string | null;
  deleted_by: string | null;
  deleted_at: string | null;
}

export interface GetDepartmentsResponse {
  success: boolean;
  data: {
    data: Department[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  timestamp: string;
}

export interface GetDepartmentsParams {
  status?: DepartmentStatus;
  sort_by?: string;
  sort_order?: SortOrder;
  page?: number;
  limit?: number;
  search?: string;
}
export interface UpdateDepartmentParams {
  name?: string;
  code?: string;
  description?: string;
  status?: DepartmentStatus;
}

export interface CreateDepartmentParams {
  code: string;
  name: string;
  description: string;
  status: DepartmentStatus;
}
export interface UpdateDepartmentParams {
  name?: string;
  status?: DepartmentStatus;
}
