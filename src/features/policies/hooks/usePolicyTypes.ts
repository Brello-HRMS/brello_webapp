import { useQuery } from '@tanstack/react-query';

import { getPolicyTypes } from '../api/policyType';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';

export const usePolicyTypes = () => {
  return useQuery({
    queryKey: ['policy-types'],
    queryFn: async () => {
      try {
        const res = await getPolicyTypes();
        return res.data;
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to fetch policy types';
        showToast(message, 'error');
        throw error;
      }
    },
    placeholderData: (prev) => prev,
  });
};
