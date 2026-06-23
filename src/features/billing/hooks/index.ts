import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '../../ToastFeature/ShowToast';
import {
  getSubscription,
  getOrgPlans,
  changePlan,
  cancelPendingChange,
  cancelSubscription,
  getCurrentInvoice,
  getInvoice,
  listInvoices,
  getInvoicePdfUrl,
  initiatePayment,
  verifyPayment,
} from '../api';

import type { ApiError } from '../../../types/common';
import type { ChangePlanRequest, InvoiceStatus, VerifyPaymentRequest } from '../types';

export const SUBSCRIPTION_KEY = ['billing', 'subscription'];
const PLANS_KEY = ['billing', 'plans'];
const CURRENT_INVOICE_KEY = ['billing', 'invoices', 'current'];
const INVOICE_LIST_KEY = ['billing', 'invoices', 'list'];

// ── Subscription / Plans ──────────────────────────────────────────────────────

export const useSubscription = () =>
  useQuery({
    queryKey: SUBSCRIPTION_KEY,
    queryFn: getSubscription,
  });

export const useOrgPlans = (cycle: string = 'Monthly') =>
  useQuery({
    queryKey: [...PLANS_KEY, cycle],
    queryFn: () => getOrgPlans(cycle),
  });

export const useChangePlan = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ChangePlanRequest) => changePlan(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SUBSCRIPTION_KEY });
      qc.invalidateQueries({ queryKey: CURRENT_INVOICE_KEY });
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to change plan. Please try again.', 'error');
    },
  });
};

export const useCancelPendingChange = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelPendingChange,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SUBSCRIPTION_KEY });
      showToast('Pending plan change has been cancelled.', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to cancel plan change.', 'error');
    },
  });
};

export const useCancelSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SUBSCRIPTION_KEY });
      showToast('Your subscription has been cancelled.', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to cancel subscription.', 'error');
    },
  });
};

// ── Invoices ──────────────────────────────────────────────────────────────────

export const useCurrentInvoice = () =>
  useQuery({
    queryKey: CURRENT_INVOICE_KEY,
    queryFn: getCurrentInvoice,
    retry: false,
  });

export const useInvoice = (id: string) =>
  useQuery({
    queryKey: ['billing', 'invoices', id],
    queryFn: () => getInvoice(id),
    enabled: !!id,
  });

export const useInvoiceList = (params: {
  page?: number;
  limit?: number;
  invoice_status?: InvoiceStatus;
}) =>
  useQuery({
    queryKey: [...INVOICE_LIST_KEY, params],
    queryFn: () => listInvoices(params),
  });

export const useInvoicePdfUrl = () =>
  useMutation({
    mutationFn: (invoiceId: string) => getInvoicePdfUrl(invoiceId),
    onError: () => {
      showToast('Failed to generate PDF. Please try again.', 'error');
    },
  });

// ── Payments ──────────────────────────────────────────────────────────────────

export const useInitiatePayment = () =>
  useMutation({
    mutationFn: (invoiceId: string) => initiatePayment(invoiceId),
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to initiate payment. Please try again.', 'error');
    },
  });

export const useVerifyPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: VerifyPaymentRequest) => verifyPayment(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SUBSCRIPTION_KEY });
      qc.invalidateQueries({ queryKey: CURRENT_INVOICE_KEY });
      qc.invalidateQueries({ queryKey: INVOICE_LIST_KEY });
    },
    onError: () => {
      showToast(
        'Payment verification failed. Please contact support if amount was deducted.',
        'error',
      );
    },
  });
};
