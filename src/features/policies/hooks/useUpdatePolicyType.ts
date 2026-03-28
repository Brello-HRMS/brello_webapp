import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updatePolicyType } from '../api/policyType';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { UpdatePolicyTypeParams } from '../types/policyType';

export const useUpdatePolicyType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, params }: { id: string; params: UpdatePolicyTypeParams }) =>
      updatePolicyType(id, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy-types'] });
      showToast('Policy type updated successfully', 'success');
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to update policy type';
      showToast(message, 'error');
    },
  });
};
