import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createClient } from '../api/client';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { UseMutationOptions } from '@tanstack/react-query';
import type { Client, CreateClientParams } from '../types/clientType';

export const useAddClient = (
  options?: Omit<UseMutationOptions<Client, ApiError, CreateClientParams>, 'mutationFn'>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateClientParams) => createClient(params),
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      showToast('Client added successfully', 'success');
      options?.onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      const message = error?.data?.message || 'Failed to add client';
      showToast(message, 'error');
      options?.onError?.(error, variables, context, mutation);
    },
    ...options,
  });
};
