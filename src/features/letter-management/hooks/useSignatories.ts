import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getSignatories,
  createSignatory,
  updateSignatory,
  setDefaultSignatory,
  archiveSignatory,
  unarchiveSignatory,
} from '../api/signatory';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { CreateSignatoryParams, UpdateSignatoryParams } from '../api/signatory';

export const useSignatories = (search?: string) => {
  return useQuery({
    queryKey: ['signatories', search],
    queryFn: async () => {
      try {
        const data = await getSignatories(search);
        return data;
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to fetch signatories';
        showToast(message, 'error');
        throw error;
      }
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateSignatory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateSignatoryParams) => createSignatory(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signatories'] });
      showToast('Signatory created successfully', 'success');
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to create signatory';
      showToast(message, 'error');
    },
  });
};

export const useUpdateSignatory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, params }: { id: string; params: UpdateSignatoryParams }) =>
      updateSignatory(id, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signatories'] });
      showToast('Signatory updated successfully', 'success');
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to update signatory';
      showToast(message, 'error');
    },
  });
};

export const useSetDefaultSignatory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => setDefaultSignatory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signatories'] });
      showToast('Default signatory updated successfully', 'success');
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to set default signatory';
      showToast(message, 'error');
    },
  });
};

export const useArchiveSignatory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => archiveSignatory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signatories'] });
      showToast('Signatory archived successfully', 'success');
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to archive signatory';
      showToast(message, 'error');
    },
  });
};

export const useUnarchiveSignatory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => unarchiveSignatory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['signatories'] });
      showToast('Signatory restored successfully', 'success');
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to restore signatory';
      showToast(message, 'error');
    },
  });
};
