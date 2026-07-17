import { useQuery } from '@tanstack/react-query';

import { getOrgTree } from '../api/hierarchy';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';

export const useOrgTree = () => {
  return useQuery({
    queryKey: ['hierarchy', 'tree'],
    queryFn: async () => {
      try {
        const res = await getOrgTree();
        return res.data;
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to load company structure';
        showToast(message, 'error');
        throw error;
      }
    },
    staleTime: 60 * 1000,
  });
};
