import { apiClient } from '../lib/axios';
import { envVars } from '../utils/envVars';

import type { ApiResponse, PaginatedResponse } from '../types/common';

const BASE = envVars.BRELLO_BASE_API;

export interface UserRoleMapItem {
  id: string;
  user_id: string;
  role_id: string;
  role: {
    id: string;
    name: string;
    description: string;
    app_id?: string;
  };
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    department?: {
      id: string;
      name: string;
    };
  };
  organization_id: string;
  created_at: string;
}

export const getUserRoleMaps = (
  params?: Record<string, string | number | undefined>,
): Promise<ApiResponse<PaginatedResponse<UserRoleMapItem>>> =>
  apiClient.get(`${BASE}/user-role-maps`, { params });

export const createUserRoleMap = (data: {
  user_id: string;
  role_id: string;
  organization_id: string;
}): Promise<unknown> => apiClient.post(`${BASE}/user-role-maps`, data);

export const deleteUserRoleMap = (id: string): Promise<void> =>
  apiClient.delete(`${BASE}/user-role-maps/${id}`);
