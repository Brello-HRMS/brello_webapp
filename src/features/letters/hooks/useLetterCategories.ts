import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getLetterCategories,
  createLetterCategory,
  updateLetterCategory,
  deleteLetterCategory,
} from '../api/letterCategory';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { CreateLetterCategoryParams, UpdateLetterCategoryParams } from '../types/letterTypes';

const QUERY_KEY = ['letter-categories'] as const;

export const useLetterCategories = () =>
  useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      try {
        const res = await getLetterCategories();
        return res.data;
      } catch (error) {
        showToast((error as ApiError)?.data?.message ?? 'Failed to fetch categories', 'error');
        throw error;
      }
    },
    placeholderData: (prev) => prev,
  });

export const useCreateLetterCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: CreateLetterCategoryParams) => createLetterCategory(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Category created', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message ?? 'Failed to create category', 'error');
    },
  });
};

export const useUpdateLetterCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, params }: { id: string; params: UpdateLetterCategoryParams }) =>
      updateLetterCategory(id, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Category updated', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message ?? 'Failed to update category', 'error');
    },
  });
};

export const useDeleteLetterCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLetterCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Category deleted', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message ?? 'Failed to delete category', 'error');
    },
  });
};
