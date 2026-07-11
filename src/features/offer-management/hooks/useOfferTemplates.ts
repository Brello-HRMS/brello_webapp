import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import {
  getOfferTemplates,
  getOfferTemplate,
  createOfferTemplate,
  updateOfferTemplate,
  publishOfferTemplate,
  archiveOfferTemplate,
  duplicateOfferTemplate,
} from '../api/offerTemplate.api';

import type {
  CreateOfferTemplateParams,
  UpdateOfferTemplateParams,
  OfferTemplateFilters,
} from '../types/offerTypes';

const KEYS = {
  all: ['offer-templates'] as const,
  list: (filters?: OfferTemplateFilters) => [...KEYS.all, 'list', filters] as const,
  detail: (id: string) => [...KEYS.all, 'detail', id] as const,
};

export function useOfferTemplates(filters?: OfferTemplateFilters) {
  return useQuery({
    queryKey: KEYS.list(filters),
    queryFn: () => getOfferTemplates(filters),
  });
}

export function useOfferTemplate(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => getOfferTemplate(id),
    enabled: !!id,
  });
}

export function useCreateOfferTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: CreateOfferTemplateParams) => createOfferTemplate(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      toast.success('Template created');
    },
    onError: () => toast.error('Failed to create template'),
  });
}

export function useUpdateOfferTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, params }: { id: string; params: UpdateOfferTemplateParams }) =>
      updateOfferTemplate(id, params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      toast.success('Template updated');
    },
    onError: () => toast.error('Failed to update template'),
  });
}

export function usePublishOfferTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => publishOfferTemplate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      toast.success('Template published');
    },
    onError: () => toast.error('Failed to publish template'),
  });
}

export function useArchiveOfferTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveOfferTemplate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      toast.success('Template archived');
    },
    onError: () => toast.error('Failed to archive template'),
  });
}

export function useDuplicateOfferTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => duplicateOfferTemplate(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all });
      toast.success('Template duplicated');
    },
    onError: () => toast.error('Failed to duplicate template'),
  });
}
