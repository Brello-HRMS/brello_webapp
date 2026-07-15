import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import {
  getOffers,
  getOffer,
  createOffer,
  updateOffer,
  sendOffer,
  withdrawOffer,
  extendOfferExpiry,
  getOfferTimeline,
  getOfferAnalytics,
  getOfferSettings,
  updateOfferSettings,
  syncOffer,
  linkEmployeeToOffer,
  getOfferVersions,
  getOfferDocuments,
  addOfferDocument,
  verifyOfferDocument,
  deleteOfferDocument,
  getOfferMessages,
  sendOfferMessage,
} from '../api/offer.api';

import type {
  CreateOfferParams,
  UpdateOfferParams,
  SendOfferParams,
  WithdrawOfferParams,
  ExtendExpiryParams,
  OfferFilters,
  UpdateOfferSettingsParams,
} from '../types/offerTypes';

const KEYS = {
  offers: ['offers'] as const,
  offerList: (filters?: OfferFilters) => [...KEYS.offers, 'list', filters] as const,
  offerDetail: (id: string) => [...KEYS.offers, 'detail', id] as const,
  timeline: (id: string) => [...KEYS.offers, 'timeline', id] as const,
  versions: (id: string) => [...KEYS.offers, 'versions', id] as const,
  documents: (id: string) => [...KEYS.offers, 'documents', id] as const,
  messages: (id: string) => [...KEYS.offers, 'messages', id] as const,
  analytics: ['offer-analytics'] as const,
  settings: ['offer-settings'] as const,
};

export function useOffers(filters?: OfferFilters) {
  return useQuery({
    queryKey: KEYS.offerList(filters),
    queryFn: () => getOffers(filters),
  });
}

export function useOffer(id: string) {
  return useQuery({
    queryKey: KEYS.offerDetail(id),
    queryFn: () => getOffer(id),
    enabled: !!id,
  });
}

export function useOfferTimeline(id: string) {
  return useQuery({
    queryKey: KEYS.timeline(id),
    queryFn: () => getOfferTimeline(id),
    enabled: !!id,
  });
}

export function useOfferVersions(id: string) {
  return useQuery({
    queryKey: KEYS.versions(id),
    queryFn: () => getOfferVersions(id),
    enabled: !!id,
  });
}

export function useCreateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: CreateOfferParams) => createOffer(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.offers });
      toast.success('Offer draft created');
    },
    onError: () => toast.error('Failed to create offer'),
  });
}

export function useUpdateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, params }: { id: string; params: UpdateOfferParams }) =>
      updateOffer(id, params),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.offers }),
    onError: () => toast.error('Failed to update offer'),
  });
}

export function useSendOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, params }: { id: string; params?: SendOfferParams }) => sendOffer(id, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.offers });
      toast.success('Offer sent to candidate');
    },
    onError: () => toast.error('Failed to send offer'),
  });
}

export function useWithdrawOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, params }: { id: string; params: WithdrawOfferParams }) =>
      withdrawOffer(id, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.offers });
      toast.success('Offer withdrawn');
    },
    onError: () => toast.error('Failed to withdraw offer'),
  });
}

export function useExtendOfferExpiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, params }: { id: string; params: ExtendExpiryParams }) =>
      extendOfferExpiry(id, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.offers });
      toast.success('Expiry extended');
    },
    onError: () => toast.error('Failed to extend expiry'),
  });
}

export function useOfferAnalytics() {
  return useQuery({
    queryKey: KEYS.analytics,
    queryFn: () => getOfferAnalytics(),
  });
}

export function useOfferSettings() {
  return useQuery({
    queryKey: KEYS.settings,
    queryFn: () => getOfferSettings(),
  });
}

export function useUpdateOfferSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: UpdateOfferSettingsParams) => updateOfferSettings(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.settings });
      toast.success('Settings saved');
    },
    onError: () => toast.error('Failed to save settings'),
  });
}

export function useSyncOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => syncOffer(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.offers });
      toast.success('Offer successfully synced to employee directory');
    },
    onError: () => toast.error('Failed to sync offer to employee'),
  });
}

export function useLinkEmployeeToOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, employeeId }: { id: string; employeeId: string }) =>
      linkEmployeeToOffer(id, employeeId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.offers });
      toast.success('Salary assigned and offer marked as synced');
    },
    onError: () => toast.error('Employee was created, but linking it to the offer failed'),
  });
}

// ── Documents ────────────────────────────────────────────────────────────────

export function useOfferDocuments(offerId: string) {
  return useQuery({
    queryKey: KEYS.documents(offerId),
    queryFn: () => getOfferDocuments(offerId),
    enabled: !!offerId,
  });
}

export function useAddOfferDocument(offerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { document_type: string; file_url: string; original_filename?: string }) =>
      addOfferDocument(offerId, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.documents(offerId) });
      toast.success('Document uploaded');
    },
    onError: () => toast.error('Failed to upload document'),
  });
}

export function useVerifyOfferDocument(offerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      documentId,
      params,
    }: {
      documentId: string;
      params: { status: 'verified' | 'rejected'; reason?: string };
    }) => verifyOfferDocument(offerId, documentId, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.documents(offerId) });
      toast.success('Document status updated');
    },
    onError: () => toast.error('Failed to update document status'),
  });
}

export function useDeleteOfferDocument(offerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => deleteOfferDocument(offerId, documentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.documents(offerId) });
      toast.success('Document deleted');
    },
    onError: () => toast.error('Failed to delete document'),
  });
}

// ── Messages ─────────────────────────────────────────────────────────────────

export function useOfferMessages(offerId: string) {
  return useQuery({
    queryKey: KEYS.messages(offerId),
    queryFn: () => getOfferMessages(offerId),
    enabled: !!offerId,
    refetchInterval: 10000, // Poll every 10s for new messages
  });
}

export function useSendOfferMessage(offerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { message: string; attachments?: string[] }) =>
      sendOfferMessage(offerId, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.messages(offerId) });
    },
    onError: () => toast.error('Failed to send message'),
  });
}
