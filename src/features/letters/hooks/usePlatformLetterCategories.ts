import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getPlatformLetterCategories,
  createPlatformLetterCategory,
  updatePlatformLetterCategory,
  deletePlatformLetterCategory,
} from '../api/platformLetterCategory';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type {
  CreateLetterCategoryParams,
  UpdateLetterCategoryParams,
} from '../types/letterTypes';

const QUERY_KEY = () => ['platform-letter-categories'];

export const usePlatformLetterCategories = () =>
  useQuery({
    queryKey: QUERY_KEY(),
    queryFn: async () => {
      try {
        const res = await getPlatformLetterCategories();
        return res.data;
      } catch (error) {
        showToast((error as ApiError)?.data?.message ?? 'Failed to fetch categories', 'error');
        throw error;
      }
    },
    placeholderData: (prev) => prev,
  });

export const useCreatePlatformLetterCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: CreateLetterCategoryParams) => createPlatformLetterCategory(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-letter-categories'] });
      showToast('Category created', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message ?? 'Failed to create category', 'error');
    },
  });
};

export const useUpdatePlatformLetterCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, params }: { id: string; params: UpdateLetterCategoryParams }) =>
      updatePlatformLetterCategory(id, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-letter-categories'] });
      showToast('Category updated', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message ?? 'Failed to update category', 'error');
    },
  });
};

export const useDeletePlatformLetterCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlatformLetterCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-letter-categories'] });
      showToast('Category deleted', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message ?? 'Failed to delete category', 'error');
    },
  });
};
