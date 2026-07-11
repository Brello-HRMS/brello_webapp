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
