import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deletePolicy } from '../api/policy';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';

export const useDeletePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies-grouped'] });
      showToast('Policy deleted successfully', 'success');
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to delete policy';
      showToast(message, 'error');
    },
  });
};
