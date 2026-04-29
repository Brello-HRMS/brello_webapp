import { apiClient } from '../lib/axios';
import { envVars } from '../utils/envVars';

const BASE = envVars.BRELLO_BASE_API;

export interface UserRoleMapItem {
  id: string;
  user_id: string;
  role_id: string;
  role: { id: string; name: string };
  organization_id: string;
  created_at: string;
}

export const getUserRoleMaps = (): Promise<{ data: UserRoleMapItem[] }> =>
  apiClient.get(`${BASE}/user-role-maps`);

export const createUserRoleMap = (data: {
  user_id: string;
  role_id: string;
  organization_id: string;
}): Promise<unknown> => apiClient.post(`${BASE}/user-role-maps`, data);

export const deleteUserRoleMap = (id: string): Promise<void> =>
  apiClient.delete(`${BASE}/user-role-maps/${id}`);
