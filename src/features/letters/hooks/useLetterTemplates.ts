import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getLetterTemplates,
  createLetterTemplate,
  updateLetterTemplate,
  deleteLetterTemplate,
} from '../api/letterTemplate';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { CreateLetterTemplateParams, UpdateLetterTemplateParams } from '../types/letterTypes';

const queryKey = (categoryId?: string) =>
  categoryId ? ['letter-templates', categoryId] : ['letter-templates'];

export const useLetterTemplates = (categoryId?: string) =>
  useQuery({
    queryKey: queryKey(categoryId),
    queryFn: async () => {
      try {
        const res = await getLetterTemplates(categoryId);
        return res.data;
      } catch (error) {
        showToast((error as ApiError)?.data?.message ?? 'Failed to fetch templates', 'error');
        throw error;
      }
    },
    enabled: !!categoryId,
  });

export const useCreateLetterTemplate = (categoryId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: CreateLetterTemplateParams) => createLetterTemplate(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey(categoryId) });
      showToast('Template created', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message ?? 'Failed to create template', 'error');
    },
  });
};

export const useUpdateLetterTemplate = (categoryId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, params }: { id: string; params: UpdateLetterTemplateParams }) =>
      updateLetterTemplate(id, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey(categoryId) });
      showToast('Template updated', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message ?? 'Failed to update template', 'error');
    },
  });
};

export const useDeleteLetterTemplate = (categoryId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLetterTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey(categoryId) });
      showToast('Template deleted', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message ?? 'Failed to delete template', 'error');
    },
  });
};

