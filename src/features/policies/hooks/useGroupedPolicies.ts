import { useQuery } from '@tanstack/react-query';

import { getGroupedPolicies } from '../api/policy';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';

export const useGroupedPolicies = () => {
  return useQuery({
    queryKey: ['policies-grouped'],
    queryFn: async () => {
      try {
        const res = await getGroupedPolicies();
        return res.data;
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to fetch policies';
        showToast(message, 'error');
        throw error;
      }
    },
    placeholderData: (prev) => prev,
  });
};
