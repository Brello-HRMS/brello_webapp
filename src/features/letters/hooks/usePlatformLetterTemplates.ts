import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getPlatformLetterTemplates,
  createPlatformLetterTemplate,
  updatePlatformLetterTemplate,
  deletePlatformLetterTemplate,
} from '../api/platformLetterTemplate';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type {
  CreateLetterTemplateParams,
  UpdateLetterTemplateParams,
} from '../types/letterTypes';

const QUERY_KEY = (categoryId?: string) =>
  categoryId ? ['platform-letter-templates', categoryId] : ['platform-letter-templates'];

export const usePlatformLetterTemplates = (categoryId?: string) =>
  useQuery({
    queryKey: QUERY_KEY(categoryId),
    queryFn: async () => {
      try {
        const res = await getPlatformLetterTemplates(categoryId);
        return res.data;
      } catch (error) {
        showToast((error as ApiError)?.data?.message ?? 'Failed to fetch templates', 'error');
        throw error;
      }
    },
    enabled: categoryId !== undefined,
    placeholderData: (prev) => prev,
  });

export const useCreatePlatformLetterTemplate = (categoryId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: CreateLetterTemplateParams) => createPlatformLetterTemplate(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-letter-templates', categoryId] });
      showToast('Template created', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message ?? 'Failed to create template', 'error');
    },
  });
};

export const useUpdatePlatformLetterTemplate = (categoryId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, params }: { id: string; params: UpdateLetterTemplateParams }) =>
      updatePlatformLetterTemplate(id, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-letter-templates', categoryId] });
      showToast('Template updated', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message ?? 'Failed to update template', 'error');
    },
  });
};

export const useDeletePlatformLetterTemplate = (categoryId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlatformLetterTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-letter-templates', categoryId] });
      showToast('Template deleted', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message ?? 'Failed to delete template', 'error');
    },
  });
};
