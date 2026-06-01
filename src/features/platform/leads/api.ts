import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type { LeadsResponse, LeadResponse, LeadStatus, UpdateLeadStatusRequest } from './types';

const BASE = `${envVars.BRELLO_BASE_API}/leads`;

export const getLeads = (params?: {
  status?: LeadStatus;
  source?: string;
}): Promise<LeadsResponse> => {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.source) query.set('source', params.source);
  const qs = query.toString();
  return apiClient.get(`${BASE}${qs ? `?${qs}` : ''}`);
};

export const getLead = (id: string): Promise<LeadResponse> => apiClient.get(`${BASE}/${id}`);

export const updateLeadStatus = (
  id: string,
  data: UpdateLeadStatusRequest,
): Promise<LeadResponse> => apiClient.patch(`${BASE}/${id}/status`, data);
