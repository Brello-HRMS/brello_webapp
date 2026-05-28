import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '../../ToastFeature/ShowToast';

import { getActions, createAction, updateAction, deleteAction } from './api';

import type { ApiError } from '../../../types/common';
import type { CreateActionRequest, UpdateActionRequest } from './types';

export const ACTIONS_QUERY_KEY = ['platform', 'actions'];

export const useActionsList = () => useQuery({ queryKey: ACTIONS_QUERY_KEY, queryFn: getActions });

export const useCreateAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateActionRequest) => createAction(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ACTIONS_QUERY_KEY });
      showToast('Action created', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to create action', 'error');
    },
  });
};

export const useUpdateAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateActionRequest }) => updateAction(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ACTIONS_QUERY_KEY });
      showToast('Action updated', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to update action', 'error');
    },
  });
};

export const useDeleteAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAction(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ACTIONS_QUERY_KEY });
      showToast('Action deleted', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || 'Failed to delete action', 'error');
    },
  });
};
