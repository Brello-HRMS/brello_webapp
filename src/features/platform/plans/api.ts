import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type { PlansResponse, CreatePlanRequest, UpdatePlanRequest } from './types';

const BASE = `${envVars.BRELLO_BASE_API}/plans`;

export const getPlans = (): Promise<PlansResponse> => apiClient.get(BASE);

export const createPlan = (
  data: CreatePlanRequest,
): Promise<{ success: boolean; data: { id: string; name: string } }> => apiClient.post(BASE, data);

export const updatePlan = (
  id: string,
  data: UpdatePlanRequest,
): Promise<{ success: boolean; data: { id: string; name: string } }> =>
  apiClient.patch(`${BASE}/${id}`, data);

export const deletePlan = (id: string): Promise<void> => apiClient.delete(`${BASE}/${id}`);
