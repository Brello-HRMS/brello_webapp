import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type { MenuApiResponse } from '../types/sidebarType';

export const getMenu = async (): Promise<MenuApiResponse> => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/menu`);
};
