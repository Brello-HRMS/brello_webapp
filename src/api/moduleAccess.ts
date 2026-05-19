import { apiClient } from '../lib/axios';
import { envVars } from '../utils/envVars';

export const checkModuleAccess = () => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/menu/permissions`);
};

export const getRolePermissionsList = (roleId: string) => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/module-access/role/${roleId}/permissions-list`);
};

export const updateRolePermissionsList = (
  roleId: string,
  permissions: Array<{ module_id: string; action_id: string; checked: boolean }>,
) => {
  return apiClient.put(`${envVars.BRELLO_BASE_API}/module-access/role/${roleId}/permissions-list`, {
    permissions,
  });
};
