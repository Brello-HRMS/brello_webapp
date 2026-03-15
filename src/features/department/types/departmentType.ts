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
  employee_count: number;
  modified_at: string | null;
  deleted_by: string | null;
  deleted_at: string | null;
}

export interface GetDepartmentsResponse {
  success: boolean;
  data: Department[];
  timestamp: string;
}

export interface GetDepartmentsParams {
  status?: DepartmentStatus;
  sort_by?: string;
  sort_order?: SortOrder;
}
export interface UpdateDepartmentParams {
  name?: string;
  status?: DepartmentStatus;
}
