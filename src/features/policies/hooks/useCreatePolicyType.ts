import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createPolicyType } from '../api/policyType';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { CreatePolicyTypeParams } from '../types/policyType';

export const useCreatePolicyType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreatePolicyTypeParams) => createPolicyType(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy-types'] });
      showToast('Policy type created successfully', 'success');
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to create policy type';
      showToast(message, 'error');
    },
  });
};
