import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteClient } from '../api/client';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { UseMutationOptions } from '@tanstack/react-query';

export const useDeleteClient = (
  options?: Omit<UseMutationOptions<void, ApiError, string>, 'mutationFn'>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteClient(id),
    onSuccess: (data, variables, context, mutation) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      showToast('Client deleted successfully', 'success');
      options?.onSuccess?.(data, variables, context, mutation);
    },
    onError: (error, variables, context, mutation) => {
      const message = error?.data?.message || 'Failed to delete client';
      showToast(message, 'error');
      options?.onError?.(error, variables, context, mutation);
    },
    ...options,
  });
};
