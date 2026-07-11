import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import {
  getOfferCandidates,
  getOfferCandidate,
  createOfferCandidate,
  updateOfferCandidate,
} from '../api/offerCandidate.api';

import type {
  CreateOfferCandidateParams,
  UpdateOfferCandidateParams,
  CandidateFilters,
} from '../types/offerTypes';

const KEYS = {
  all: ['offer-candidates'] as const,
  list: (filters?: CandidateFilters) => [...KEYS.all, 'list', filters] as const,
  detail: (id: string) => [...KEYS.all, 'detail', id] as const,
};

export function useOfferCandidates(filters?: CandidateFilters) {
  return useQuery({
    queryKey: KEYS.list(filters),
    queryFn: () => getOfferCandidates(filters),
  });
}

export function useOfferCandidate(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => getOfferCandidate(id),
    enabled: !!id,
  });
}

export function useCreateOfferCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: CreateOfferCandidateParams) => createOfferCandidate(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      toast.success('Candidate added');
    },
    onError: () => toast.error('Failed to add candidate'),
  });
}

export function useUpdateOfferCandidate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, params }: { id: string; params: UpdateOfferCandidateParams }) =>
      updateOfferCandidate(id, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      toast.success('Candidate updated');
    },
    onError: () => toast.error('Failed to update candidate'),
  });
}
