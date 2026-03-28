import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deletePolicyType } from '../api/policyType';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';

export const useDeletePolicyType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePolicyType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy-types'] });
      showToast('Policy type deleted successfully', 'success');
    },
    onError: (error: ApiError) => {
      const message = error?.data?.message || 'Failed to delete policy type';
      showToast(message, 'error');
    },
  });
};
