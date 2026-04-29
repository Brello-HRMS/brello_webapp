import { apiClient } from '../lib/axios';
import { envVars } from '../utils/envVars';

export const getRoles = async () => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/roles`);
};
