import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '../../ToastFeature/ShowToast';

import {
  getPlatformDesignations,
  createPlatformDesignation,
  updatePlatformDesignation,
  deletePlatformDesignation,
} from './api';

import type { ApiError } from '../../../types/common';
import type { CreatePlatformDesignationRequest, UpdatePlatformDesignationRequest } from './types';

const QUERY_KEY = ['platform', 'designations'];

export const usePlatformDesignationsList = () =>
  useQuery({
    queryKey: QUERY_KEY,
    queryFn: getPlatformDesignations,
  });

export const useCreatePlatformDesignation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePlatformDesignationRequest) => createPlatformDesignation(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Designation created', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to create designation', 'error');
    },
  });
};

export const useUpdatePlatformDesignation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlatformDesignationRequest }) =>
      updatePlatformDesignation(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Designation updated', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to update designation', 'error');
    },
  });
};

export const useDeletePlatformDesignation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlatformDesignation(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Designation deleted', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to delete designation', 'error');
    },
  });
};
