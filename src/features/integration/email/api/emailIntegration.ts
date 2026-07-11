import { apiClient } from '../../../../lib/axios';
import { envVars } from '../../../../utils/envVars';

import type {
  EmailIntegration,
  GetEmailIntegrationsResponse,
  GetGoogleAuthUrlResponse,
  TestEmailResponse,
} from '../types/emailIntegrationType';

const BASE = `${envVars.BRELLO_BASE_API}/email-integrations`;

export const getEmailIntegrations = async (): Promise<GetEmailIntegrationsResponse> => {
  return apiClient.get(BASE);
};

export const getGoogleAuthUrl = async (): Promise<GetGoogleAuthUrlResponse> => {
  return apiClient.get(`${BASE}/google/auth-url`);
};

export const activateIntegration = async (id: string): Promise<EmailIntegration> => {
  return apiClient.patch(`${BASE}/${id}/activate`);
};

export const deactivateIntegration = async (id: string): Promise<EmailIntegration> => {
  return apiClient.patch(`${BASE}/${id}/deactivate`);
};

export const disconnectIntegration = async (id: string): Promise<void> => {
  return apiClient.delete(`${BASE}/${id}`);
};

export const sendTestEmail = async (id: string, to?: string): Promise<TestEmailResponse> => {
  return apiClient.post(`${BASE}/${id}/test`, to ? { to } : {});
};
