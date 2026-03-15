import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type {
  Department,
  GetDepartmentsParams,
  GetDepartmentsResponse,
  UpdateDepartmentParams,
  CreateDepartmentParams,
} from '../types/departmentType';

export const getDepartments = async (
  params?: GetDepartmentsParams,
): Promise<GetDepartmentsResponse> => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/departments`, { params });
};

export const deleteDepartment = async (id: string): Promise<void> => {
  return apiClient.delete(`${envVars.BRELLO_BASE_API}/departments/${id}`);
};
export const updateDepartment = async (
  id: string,
  params: UpdateDepartmentParams,
): Promise<Department> => {
  return apiClient.patch(`${envVars.BRELLO_BASE_API}/departments/${id}`, params);
};

export const getDepartmentById = async (id: string): Promise<Department> => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/departments/${id}`);
};

export const createDepartment = async (params: CreateDepartmentParams): Promise<Department> => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/departments`, params);
};
