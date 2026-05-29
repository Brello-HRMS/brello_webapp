import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '../../ToastFeature/ShowToast';

import { getEnterprises, createEnterprise, updateEnterprise, deleteEnterprise } from './api';

import type { ApiError } from '../../../types/common';
import type { CreateEnterpriseRequest, UpdateEnterpriseRequest } from './types';

export const ENTERPRISES_QUERY_KEY = ['platform', 'enterprises'];

export const useEnterprisesList = () =>
  useQuery({
    queryKey: ENTERPRISES_QUERY_KEY,
    queryFn: getEnterprises,
  });

export const useCreateEnterprise = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEnterpriseRequest) => createEnterprise(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ENTERPRISES_QUERY_KEY });
      showToast('Enterprise created', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to create enterprise', 'error');
    },
  });
};

export const useUpdateEnterprise = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEnterpriseRequest }) =>
      updateEnterprise(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ENTERPRISES_QUERY_KEY });
      showToast('Enterprise updated', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to update enterprise', 'error');
    },
  });
};

export const useDeleteEnterprise = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteEnterprise(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ENTERPRISES_QUERY_KEY });
      showToast('Enterprise deleted', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to delete enterprise', 'error');
    },
  });
};
