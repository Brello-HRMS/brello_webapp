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

export const acceptOffer = (token: string): Promise<ApiResponse<void>> =>
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
