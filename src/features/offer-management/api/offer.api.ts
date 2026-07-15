import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type { ApiResponse, PaginatedResponse } from '../../../types/common';
import type {
  Offer,
  OfferTimeline,
  OfferVersion,
  CreateOfferParams,
  UpdateOfferParams,
  SendOfferParams,
  WithdrawOfferParams,
  ExtendExpiryParams,
  OfferFilters,
  OfferAnalytics,
  OfferSettings,
  UpdateOfferSettingsParams,
} from '../types/offerTypes';

const BASE = `${envVars.BRELLO_BASE_API}/offer-management/offers`;
const SETTINGS_BASE = `${envVars.BRELLO_BASE_API}/offer-management/settings`;
const ANALYTICS_BASE = `${envVars.BRELLO_BASE_API}/offer-management/analytics`;

// ── Offers ───────────────────────────────────────────────────────────────────

export const getOffers = (filters?: OfferFilters): Promise<ApiResponse<PaginatedResponse<Offer>>> =>
  apiClient.get(BASE, { params: filters });

export const getOffer = (id: string): Promise<ApiResponse<Offer>> => apiClient.get(`${BASE}/${id}`);

export const createOffer = (params: CreateOfferParams): Promise<ApiResponse<Offer>> =>
  apiClient.post(BASE, params);

export const updateOffer = (id: string, params: UpdateOfferParams): Promise<ApiResponse<Offer>> =>
  apiClient.patch(`${BASE}/${id}`, params);

export const sendOffer = (id: string, params?: SendOfferParams): Promise<ApiResponse<Offer>> =>
  apiClient.post(`${BASE}/${id}/send`, params);

export const withdrawOffer = (
  id: string,
  params: WithdrawOfferParams,
): Promise<ApiResponse<Offer>> => apiClient.post(`${BASE}/${id}/withdraw`, params);

export const extendOfferExpiry = (
  id: string,
  params: ExtendExpiryParams,
): Promise<ApiResponse<Offer>> => apiClient.post(`${BASE}/${id}/extend-expiry`, params);

export const syncOffer = (id: string): Promise<ApiResponse<{ userId: string }>> =>
  apiClient.post(`${BASE}/${id}/sync`);

export const linkEmployeeToOffer = (
  id: string,
  employeeId: string,
): Promise<ApiResponse<{ userId: string }>> =>
  apiClient.post(`${BASE}/${id}/link-employee`, { employee_id: employeeId });

export const getOfferTimeline = (id: string): Promise<ApiResponse<OfferTimeline[]>> =>
  apiClient.get(`${BASE}/${id}/timeline`);

export const getOfferVersions = (id: string): Promise<ApiResponse<OfferVersion[]>> =>
  apiClient.get(`${BASE}/${id}/versions`);

// ── Approval ─────────────────────────────────────────────────────────────────

export const getApprovalSteps = (offerId: string) =>
  apiClient.get(`${BASE}/${offerId}/approval/steps`);

export const submitForApproval = (offerId: string) =>
  apiClient.post(`${BASE}/${offerId}/approval/submit`);

export const approveOfferStep = (offerId: string, comment?: string) =>
  apiClient.post(`${BASE}/${offerId}/approval/approve`, { comment });

export const rejectOfferStep = (offerId: string, comment: string) =>
  apiClient.post(`${BASE}/${offerId}/approval/reject`, { comment });

// ── Settings ─────────────────────────────────────────────────────────────────

export const getOfferSettings = (): Promise<ApiResponse<OfferSettings>> =>
  apiClient.get(SETTINGS_BASE);

export const updateOfferSettings = (
  params: UpdateOfferSettingsParams,
): Promise<ApiResponse<OfferSettings>> => apiClient.patch(SETTINGS_BASE, params);

// ── Analytics ─────────────────────────────────────────────────────────────────

export const getOfferAnalytics = (): Promise<ApiResponse<OfferAnalytics>> =>
  apiClient.get(ANALYTICS_BASE);

// ── Documents ────────────────────────────────────────────────────────────────

export const getOfferDocuments = (offerId: string) => apiClient.get(`${BASE}/${offerId}/documents`);

export const addOfferDocument = (
  offerId: string,
  params: { document_type: string; file_url: string; original_filename?: string },
) => apiClient.post(`${BASE}/${offerId}/documents`, params);

export const verifyOfferDocument = (
  offerId: string,
  documentId: string,
  params: { status: 'verified' | 'rejected'; reason?: string },
) => apiClient.patch(`${BASE}/${offerId}/documents/${documentId}/verify`, params);

export const deleteOfferDocument = (offerId: string, documentId: string) =>
  apiClient.delete(`${BASE}/${offerId}/documents/${documentId}`);

// ── Messages ─────────────────────────────────────────────────────────────────

export const getOfferMessages = (offerId: string) => apiClient.get(`${BASE}/${offerId}/messages`);

export const sendOfferMessage = (
  offerId: string,
  params: { message: string; attachments?: string[] },
) => apiClient.post(`${BASE}/${offerId}/messages`, params);
