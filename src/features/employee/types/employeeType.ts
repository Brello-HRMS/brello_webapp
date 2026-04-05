import { Status, SortOrder } from '../../../types/common';

export type EmployeeStatus = Status;

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: EmployeeStatus | string;
  avatar: string | null;
  memberAvatars: string[];

  // Fallback fields per user request, API currently doesn't provide them
  department?: string;
  type?: string;
  location?: string;
  role?: string;
}

export interface GetEmployeesResponse {
  success: boolean;
  data: {
    data: Employee[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  timestamp: string;
}

export interface GetEmployeesParams {
  status?: EmployeeStatus | string;
  sort_by?: string;
  sort_order?: SortOrder | string;
  page?: number;
  limit?: number;
  search?: string;
}
