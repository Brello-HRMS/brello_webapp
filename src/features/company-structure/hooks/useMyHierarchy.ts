import { useQuery } from '@tanstack/react-query';

import { getMyHierarchy } from '../api/hierarchy';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';

export const useMyHierarchy = () => {
  return useQuery({
    queryKey: ['hierarchy', 'me'],
    queryFn: async () => {
      try {
        const res = await getMyHierarchy();
        return res.data;
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to load your team';
        showToast(message, 'error');
        throw error;
      }
    },
    staleTime: 60 * 1000,
  });
};
