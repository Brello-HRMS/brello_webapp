import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createPolicy } from '../api/policy';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { CreatePolicyParams } from '../types/policyType';

export const useCreatePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreatePolicyParams) => createPolicy(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies-grouped'] });
      showToast('Policy created successfully', 'success');
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to create policy';
      showToast(message, 'error');
    },
  });
};
