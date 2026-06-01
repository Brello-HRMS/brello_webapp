import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type {
  PlatformDepartmentsResponse,
  CreatePlatformDepartmentRequest,
  UpdatePlatformDepartmentRequest,
} from './types';

const BASE = `${envVars.BRELLO_BASE_API}/platform-admin/departments`;

export const getPlatformDepartments = (): Promise<PlatformDepartmentsResponse> =>
  apiClient.get(BASE);

export const createPlatformDepartment = (
  data: CreatePlatformDepartmentRequest,
): Promise<{ success: boolean; data: { id: string; name: string } }> => apiClient.post(BASE, data);

export const updatePlatformDepartment = (
  id: string,
  data: UpdatePlatformDepartmentRequest,
): Promise<{ success: boolean; data: { id: string; name: string } }> =>
  apiClient.patch(`${BASE}/${id}`, data);

export const deletePlatformDepartment = (id: string): Promise<void> =>
  apiClient.delete(`${BASE}/${id}`);
