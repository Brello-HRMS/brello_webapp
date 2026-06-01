import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '../../ToastFeature/ShowToast';

import {
  getPlatformRoles,
  createPlatformRole,
  updatePlatformRole,
  deletePlatformRole,
} from './api';

import type { ApiError } from '../../../types/common';
import type { CreatePlatformRoleRequest, UpdatePlatformRoleRequest } from './types';

const QUERY_KEY = ['platform', 'roles'];

export const usePlatformRoles = () => useQuery({ queryKey: QUERY_KEY, queryFn: getPlatformRoles });

export const useCreatePlatformRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePlatformRoleRequest) => createPlatformRole(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Role created', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to create role', 'error');
    },
  });
};

export const useUpdatePlatformRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlatformRoleRequest }) =>
      updatePlatformRole(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Role updated', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to update role', 'error');
    },
  });
};

export const useDeletePlatformRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePlatformRole(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY });
      showToast('Role deleted', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to delete role', 'error');
    },
  });
};
