import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type {
  SubscriptionResponse,
  OrgPlansResponse,
  SingleInvoiceResponse,
  InvoiceListResponse,
  PdfUrlResponse,
  InitiatePaymentResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  InvoiceStatus,
  ChangePlanRequest,
  ChangePlanResponse,
  CancelSubscriptionResponse,
} from '../types';

const BASE = `${envVars.BRELLO_BASE_API}/billing`;

// ── Subscription / Plans ──────────────────────────────────────────────────────

export const getSubscription = (): Promise<SubscriptionResponse> =>
  apiClient.get(`${BASE}/overview`);

export const getOrgPlans = (cycle: string = 'Monthly'): Promise<OrgPlansResponse> =>
  apiClient.get(`${BASE}/plans?cycle=${cycle}`);

export const changePlan = (data: ChangePlanRequest): Promise<ChangePlanResponse> =>
  apiClient.post(`${BASE}/subscriptions/change-plan`, data);

export const cancelPendingChange = (): Promise<CancelSubscriptionResponse> =>
  apiClient.post(`${BASE}/subscriptions/cancel-pending-change`);

export const cancelSubscription = (): Promise<CancelSubscriptionResponse> =>
  apiClient.post(`${BASE}/subscriptions/cancel`);

// ── Invoices ──────────────────────────────────────────────────────────────────

export const getCurrentInvoice = async (): Promise<SingleInvoiceResponse | null> => {
  try {
    return await apiClient.get(`${BASE}/invoices/current`);
  } catch (err: unknown) {
    const axiosErr = err as { response?: { status?: number } };
    if (axiosErr?.response?.status === 404) return null;
    throw err;
  }
};

export const getInvoice = (id: string): Promise<SingleInvoiceResponse> =>
  apiClient.get(`${BASE}/invoices/${id}`);

export const listInvoices = (params: {
  page?: number;
  limit?: number;
  invoice_status?: InvoiceStatus;
}): Promise<InvoiceListResponse> => apiClient.get(`${BASE}/invoices`, { params });

export const getInvoicePdfUrl = (id: string): Promise<PdfUrlResponse> =>
  apiClient.get(`${BASE}/invoices/${id}/pdf`);

// ── Payments ──────────────────────────────────────────────────────────────────

export const initiatePayment = (invoiceId: string): Promise<InitiatePaymentResponse> =>
  apiClient.post(`${BASE}/payments/initiate`, { invoice_id: invoiceId });

export const verifyPayment = (data: VerifyPaymentRequest): Promise<VerifyPaymentResponse> =>
  apiClient.post(`${BASE}/payments/verify`, data);
