import { apiClient } from '../lib/axios';
import { envVars } from '../utils/envVars';

export const checkModuleAccess = () => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/menu/permissions`);
};
