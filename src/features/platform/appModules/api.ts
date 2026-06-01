import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type { AppModulesResponse, CreateModuleRequest, UpdateModuleRequest } from './types';

const BASE = `${envVars.BRELLO_BASE_API}/app-modules`;

export const getModulesByApp = (appId: string): Promise<AppModulesResponse> =>
  apiClient.get(`${BASE}?app_id=${appId}`);

export const createModule = (
  data: CreateModuleRequest,
): Promise<{ success: boolean; data: { id: string; name: string } }> => apiClient.post(BASE, data);

export const updateModule = (
  id: string,
  data: UpdateModuleRequest,
): Promise<{ success: boolean; data: { id: string; name: string } }> =>
  apiClient.patch(`${BASE}/${id}`, data);

export const deleteModule = (id: string): Promise<void> => apiClient.delete(`${BASE}/${id}`);
