import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateClient } from '../api/client';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { UseMutationOptions } from '@tanstack/react-query';
import type { Client, UpdateClientParams } from '../types/clientType';

export interface UseUpdateClientParams {
  id: string;
  params: UpdateClientParams;
}

export const useUpdateClient = (
  options?: Omit<UseMutationOptions<Client, ApiError, UseUpdateClientParams>, 'mutationFn'>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, params }: UseUpdateClientParams) => updateClient(id, params),
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      showToast('Client updated successfully', 'success');
      options?.onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      const message = error?.data?.message || 'Failed to update client';
      showToast(message, 'error');
      options?.onError?.(error, variables, context, mutation);
    },
    ...options,
  });
};
