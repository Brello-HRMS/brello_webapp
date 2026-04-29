import { useQuery } from '@tanstack/react-query';

import { getUsers } from '../api/user';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { GetUsersResponse } from '../types/userType';
export const useUsersList = (
  options?: Omit<UseQueryOptions<GetUsersResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['usersList'],
    queryFn: async () => {
      try {
        const data = await getUsers();
        return data;
      } catch (error) {
        const message =
          (error as ApiError)?.response?.data?.message || 'Failed to fetch users list';
        showToast(message, 'error');
        throw error;
      }
    },
    ...options,
  });
};
