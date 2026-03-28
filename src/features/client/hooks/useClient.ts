import { useQuery } from '@tanstack/react-query';

import { getClientById } from '../api/client';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { Client } from '../types/clientType';

export const useClient = (
  id: string,
  options?: Omit<UseQueryOptions<Client, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      try {
        const data = await getClientById(id);
        return data?.data;
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to fetch client details';
        showToast(message, 'error');
        throw error;
      }
    },
    enabled: !!id,
    ...options,
  });
};
