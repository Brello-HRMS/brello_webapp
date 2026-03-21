import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createDesignation } from '../api/designation';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { CreateDesignationParams } from '../types/designationType';

export const useCreateDesignation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateDesignationParams) => createDesignation(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['designations'] });
      showToast('Designation created successfully', 'success');
    },
    onError: (error: ApiError) => {
      const message = error?.response?.data?.message || 'Failed to create designation';
      showToast(message, 'error');
    },
  });
};
