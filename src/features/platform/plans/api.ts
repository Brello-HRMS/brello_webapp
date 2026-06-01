import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type { PlansResponse, CreatePlanRequest, UpdatePlanRequest } from './types';

const BASE = `${envVars.BRELLO_BASE_API}/plans`;

export const getPlans = (enterpriseId?: string): Promise<PlansResponse> => {
  const qs = enterpriseId ? `?enterprise_id=${enterpriseId}` : '';
  return apiClient.get(`${BASE}${qs}`);
};

export const createPlan = (
  data: CreatePlanRequest,
): Promise<{ success: boolean; data: { id: string; name: string } }> => apiClient.post(BASE, data);

export const updatePlan = (
  id: string,
  data: UpdatePlanRequest,
): Promise<{ success: boolean; data: { id: string; name: string } }> =>
  apiClient.patch(`${BASE}/${id}`, data);

export const deletePlan = (id: string): Promise<void> => apiClient.delete(`${BASE}/${id}`);

export const getPlanApps = (planId: string): Promise<{ app_id: string }[]> =>
  apiClient.get(`${BASE}/${planId}/apps`);

export const syncPlanApps = (planId: string, appIds: string[]): Promise<void> =>
  apiClient.post(`${BASE}/${planId}/apps`, { appIds });
