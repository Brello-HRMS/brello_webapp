import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteDesignation } from '../api/designation';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';

export const useDeleteDesignation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteDesignation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      showToast('Designation deleted successfully', 'success');
    },
    onError: (error: ApiError) => {
      const message = error?.response?.data?.message || 'Failed to delete designation';
      showToast(message, 'error');
    },
  });
};
