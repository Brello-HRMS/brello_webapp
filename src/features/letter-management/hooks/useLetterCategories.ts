import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getLetterCategories,
  createLetterCategory,
  updateLetterCategory,
  archiveLetterCategory,
} from '../api/letterCategory';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { CreateLetterCategoryParams, UpdateLetterCategoryParams } from '../types/letterTypes';

export const useLetterCategories = (search?: string) => {
  return useQuery({
    queryKey: ['letter-categories', search],
    queryFn: async () => {
      try {
        const data = await getLetterCategories(search);
        return data;
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to fetch letter categories';
        showToast(message, 'error');
        throw error;
      }
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateLetterCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateLetterCategoryParams) => createLetterCategory(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['letter-categories'] });
      showToast('Category created successfully', 'success');
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to create category';
      showToast(message, 'error');
    },
  });
};

export const useUpdateLetterCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, params }: { id: string; params: UpdateLetterCategoryParams }) =>
      updateLetterCategory(id, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['letter-categories'] });
      showToast('Category updated successfully', 'success');
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to update category';
      showToast(message, 'error');
    },
  });
};

export const useArchiveLetterCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveLetterCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['letter-categories'] });
      showToast('Category archived successfully', 'success');
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to archive category';
      showToast(message, 'error');
    },
  });
};
