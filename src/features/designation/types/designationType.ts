import { Status } from '../../../types/common';

export type DesignationStatus = Status;

export interface Designation {
  id: string;
  org_id: string;
  department_id: string | null;
  code: string;
  title: string;
  level: string;
  status: DesignationStatus;
  description: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface GetDesignationsResponse {
  success: boolean;
  data: Designation[];
  timestamp: string;
}

export interface GetDesignationsParams {
  status?: DesignationStatus;
  search?: string;
}

export interface UpdateDesignationParams {
  title?: string;
  code?: string;
  description?: string;
  status?: DesignationStatus;
  department_id?: string;
}

export interface CreateDesignationParams {
  code?: string;
  title: string;
  status: DesignationStatus;
  department_id: string;
}
