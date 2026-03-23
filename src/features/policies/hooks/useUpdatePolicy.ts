import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updatePolicy } from '../api/policy';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { UpdatePolicyParams } from '../types/policyType';

export const useUpdatePolicy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, params }: { id: string; params: UpdatePolicyParams }) =>
      updatePolicy(id, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policies-grouped'] });
      showToast('Policy updated successfully', 'success');
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to update policy';
      showToast(message, 'error');
    },
  });
};
