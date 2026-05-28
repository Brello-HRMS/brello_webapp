import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '../../ToastFeature/ShowToast';

import { getApps, createApp, updateApp, deleteApp } from './api';

import type { ApiError } from '../../../types/common';
import type { CreateAppRequest, UpdateAppRequest } from './types';

export const APPS_QUERY_KEY = ['platform', 'apps'];

export const useAppsList = () =>
  useQuery({
    queryKey: APPS_QUERY_KEY,
    queryFn: getApps,
  });

export const useCreateApp = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAppRequest) => createApp(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: APPS_QUERY_KEY });
      showToast('App created', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to create app', 'error');
    },
  });
};

export const useUpdateApp = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAppRequest }) => updateApp(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: APPS_QUERY_KEY });
      showToast('App updated', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to update app', 'error');
    },
  });
};

export const useDeleteApp = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteApp(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: APPS_QUERY_KEY });
      showToast('App deleted', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to delete app', 'error');
    },
  });
};
