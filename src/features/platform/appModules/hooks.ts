import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '../../ToastFeature/ShowToast';

import { getModulesByApp, createModule, updateModule, deleteModule } from './api';

import type { ApiError } from '../../../types/common';
import type { CreateModuleRequest, UpdateModuleRequest } from './types';

const queryKey = (appId: string) => ['platform', 'app-modules', appId];

export const useModulesByApp = (appId: string | null) =>
  useQuery({
    queryKey: queryKey(appId ?? ''),
    queryFn: () => getModulesByApp(appId!),
    enabled: !!appId,
  });

export const useCreateModule = (appId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateModuleRequest) => createModule(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKey(appId) });
      showToast('Module created', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to create module', 'error');
    },
  });
};

export const useUpdateModule = (appId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateModuleRequest }) => updateModule(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKey(appId) });
      showToast('Module updated', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to update module', 'error');
    },
  });
};

export const useDeleteModule = (appId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteModule(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKey(appId) });
      showToast('Module deleted', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to delete module', 'error');
    },
  });
};
