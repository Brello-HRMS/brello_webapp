import { Status } from '../../../types/common';

export type PlatformDepartment = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  status: Status;
  created_at: string;
  updated_at: string;
};

export type PlatformDepartmentsResponse = {
  success: boolean;
  data: PlatformDepartment[];
  timestamp: string;
};

export type CreatePlatformDepartmentRequest = {
  name: string;
  code: string;
  description?: string;
  status?: Status;
};

export type UpdatePlatformDepartmentRequest = {
  name?: string;
  description?: string;
  status?: Status;
};
