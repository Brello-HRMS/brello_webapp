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
        // Map API fields (type_id, type_name) -> UI fields (id, name)
        const mappedData = res.data.map((group) => ({
          ...group,
          id: group.id || group.type_id || '',
          name: group.name || group.type_name || '',
        }));
        return mappedData;
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to fetch policies';
        showToast(message, 'error');
        throw error;
      }
    },
    placeholderData: (prev) => prev,
  });
};
