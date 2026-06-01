import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type { AppsResponse, CreateAppRequest, UpdateAppRequest } from './types';

const BASE = `${envVars.BRELLO_BASE_API}/apps`;

export const getApps = (): Promise<AppsResponse> => apiClient.get(BASE);

export const createApp = (
  data: CreateAppRequest,
): Promise<{ success: boolean; data: { id: string; name: string } }> => apiClient.post(BASE, data);

export const updateApp = (
  id: string,
  data: UpdateAppRequest,
): Promise<{ success: boolean; data: { id: string; name: string } }> =>
  apiClient.patch(`${BASE}/${id}`, data);

export const deleteApp = (id: string): Promise<void> => apiClient.delete(`${BASE}/${id}`);
