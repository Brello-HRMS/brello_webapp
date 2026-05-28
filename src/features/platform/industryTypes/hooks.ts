import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '../../ToastFeature/ShowToast';

import {
  getIndustryTypes,
  createIndustryType,
  updateIndustryType,
  deleteIndustryType,
} from './api';

import type { ApiError } from '../../../types/common';
import type { CreateIndustryTypeRequest, UpdateIndustryTypeRequest } from './types';

const QUERY_KEY = ['platform', 'industry-types'];

export const useIndustryTypesList = () =>
  useQuery({
    queryKey: QUERY_KEY,
    queryFn: getIndustryTypes,
  });

export const useCreateIndustryType = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateIndustryTypeRequest) => createIndustryType(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Industry type created', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to create industry type', 'error');
    },
  });
};

export const useUpdateIndustryType = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIndustryTypeRequest }) =>
      updateIndustryType(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Industry type updated', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to update industry type', 'error');
    },
  });
};

export const useDeleteIndustryType = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteIndustryType(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Industry type deleted', 'success');
    },
    onError: (error: ApiError) => {
      const message =
        error?.data?.message ||
        (error?.data?.statusCode === 409
          ? 'This industry type is in use and cannot be deleted'
          : 'Failed to delete industry type');
      showToast(message, 'error');
    },
  });
};
