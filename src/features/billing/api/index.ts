import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type { SubscriptionResponse, OrgPlansResponse, UpgradePlanRequest } from '../types';

const BASE = `${envVars.BRELLO_BASE_API}/billing`;

export const getSubscription = (): Promise<SubscriptionResponse> =>
  apiClient.get(`${BASE}/subscription`);

export const getOrgPlans = (): Promise<OrgPlansResponse> => apiClient.get(`${BASE}/plans`);

export const upgradePlan = (data: UpgradePlanRequest): Promise<{ success: boolean }> =>
  apiClient.post(`${BASE}/subscription/upgrade`, data);
