import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateDesignation } from '../api/designation';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { UpdateDesignationParams } from '../types/designationType';

export const useUpdateDesignation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, params }: { id: string; params: UpdateDesignationParams }) =>
      updateDesignation(id, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      showToast('Designation updated successfully', 'success');
    },
    onError: (error: ApiError) => {
      const message = error?.response?.data?.message || 'Failed to update designation';
      showToast(message, 'error');
    },
  });
};
