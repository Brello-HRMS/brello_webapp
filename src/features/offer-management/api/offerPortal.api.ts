import axios from 'axios';

import { envVars } from '../../../utils/envVars';

import type { ApiResponse } from '../../../types/common';
import type { OfferPortalData } from '../types/offerTypes';

/** Public API — no auth headers. Used by the external Candidate Portal. */
const publicClient = axios.create({
  baseURL: envVars.BRELLO_BASE_API,
  headers: { 'Content-Type': 'application/json' },
});

// Unwrap the {success, data, message, timestamp} envelope, matching apiClient's behavior.
publicClient.interceptors.response.use((response) => response.data);

const PORTAL_BASE = '/offer-portal';

export const getPortalOffer = (token: string): Promise<ApiResponse<OfferPortalData>> =>
  publicClient.get(`${PORTAL_BASE}/${token}`);

export const acceptOffer = (
  token: string,
): Promise<ApiResponse<{ accepted_pdf_url: string | null }>> =>
  publicClient.post(`${PORTAL_BASE}/accept`, { access_token: token });

export const rejectOffer = (
  token: string,
  reason: string,
  comment?: string,
): Promise<ApiResponse<void>> =>
  publicClient.post(`${PORTAL_BASE}/reject`, { access_token: token, reason, comment });

export const requestOfferChanges = (
  token: string,
  payload: {
    expected_salary?: number;
    preferred_joining_date?: string;
    comments: string;
  },
): Promise<ApiResponse<void>> =>
  publicClient.post(`${PORTAL_BASE}/request-changes`, { access_token: token, ...payload });

export const uploadOnboardingDocument = async (token: string, name: string, file: File) => {
  const formData = new FormData();
  formData.append('name', name);
  formData.append('file', file);
  const res = await publicClient.post(`${PORTAL_BASE}/${token}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res;
};
