import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getLetterCategories,
  createLetterCategory,
  updateLetterCategory,
  deleteLetterCategory,
} from '../api/letterCategory';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type {
  CreateLetterCategoryParams,
  UpdateLetterCategoryParams,
  DocumentType,
} from '../types/letterTypes';

const QUERY_KEY = (documentType?: DocumentType) =>
  documentType ? ['letter-categories', documentType] : ['letter-categories'];

export const useLetterCategories = (documentType?: DocumentType) =>
  useQuery({
    queryKey: QUERY_KEY(documentType),
    queryFn: async () => {
      try {
        const res = await getLetterCategories(documentType);
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
      queryClient.invalidateQueries({ queryKey: ['letter-categories'] });
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
      queryClient.invalidateQueries({ queryKey: ['letter-categories'] });
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
      queryClient.invalidateQueries({ queryKey: ['letter-categories'] });
      showToast('Category deleted', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message ?? 'Failed to delete category', 'error');
    },
  });
};
