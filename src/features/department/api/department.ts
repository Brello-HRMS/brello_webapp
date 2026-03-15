import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type { GetDepartmentsParams, GetDepartmentsResponse } from '../types/departmentType';

export const getDepartments = async (
  params?: GetDepartmentsParams,
): Promise<GetDepartmentsResponse> => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/departments`, { params });
};

export const deleteDepartment = async (id: string): Promise<void> => {
  return apiClient.delete(`${envVars.BRELLO_BASE_API}/departments/${id}`);
};
