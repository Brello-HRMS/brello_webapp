import { useQuery } from '@tanstack/react-query';

import { getClients } from '../api/client';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { GetClientsParams, GetClientsResponse } from '../types/clientType';

export const useClients = (
  params?: GetClientsParams,
  options?: Omit<UseQueryOptions<GetClientsResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['clients', params],
    queryFn: async () => {
      try {
        const data = await getClients(params);
        return data;
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to fetch clients';
        showToast(message, 'error');
        throw error;
      }
    },
    placeholderData: (previousData) => previousData,
    ...options,
  });
};
