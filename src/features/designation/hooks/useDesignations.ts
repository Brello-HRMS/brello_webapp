import { useQuery } from '@tanstack/react-query';

import { getDesignations } from '../api/designation';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { GetDesignationsParams, GetDesignationsResponse } from '../types/designationType';

export const useDesignations = (
  params?: GetDesignationsParams,
  options?: Omit<UseQueryOptions<GetDesignationsResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['designations', params],
    queryFn: async () => {
      try {
        const data = await getDesignations(params);
        return data;
      } catch (error) {
        const message =
          (error as ApiError)?.response?.data?.message || 'Failed to fetch designations';
        showToast(message, 'error');
        throw error;
      }
    },
    placeholderData: (previousData) => previousData,
    ...options,
  });
};
