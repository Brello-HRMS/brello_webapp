import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '../../ToastFeature/ShowToast';

import {
  getPlatformDepartments,
  createPlatformDepartment,
  updatePlatformDepartment,
  deletePlatformDepartment,
} from './api';

import type { ApiError } from '../../../types/common';
import type { CreatePlatformDepartmentRequest, UpdatePlatformDepartmentRequest } from './types';

const QUERY_KEY = ['platform', 'departments'];

export const usePlatformDepartmentsList = () =>
  useQuery({
    queryKey: QUERY_KEY,
    queryFn: getPlatformDepartments,
  });

export const useCreatePlatformDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePlatformDepartmentRequest) => createPlatformDepartment(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Department created', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to create department', 'error');
    },
  });
};

export const useUpdatePlatformDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlatformDepartmentRequest }) =>
      updatePlatformDepartment(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Department updated', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to update department', 'error');
    },
  });
};

export const useDeletePlatformDepartment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlatformDepartment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Department deleted', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to delete department', 'error');
    },
  });
};
