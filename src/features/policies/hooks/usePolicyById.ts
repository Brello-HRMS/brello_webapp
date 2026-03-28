import { useQuery } from '@tanstack/react-query';

import { getPolicyById } from '../api/policy';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';

export const usePolicyById = (id: string | null) => {
  return useQuery({
    queryKey: ['policy', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const res = await getPolicyById(id);
        return res.data;
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to fetch policy details';
        showToast(message, 'error');
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
