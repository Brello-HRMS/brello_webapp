import { useQuery } from '@tanstack/react-query';

import { getUserById } from '../api/user';

import type { UseQueryOptions } from '@tanstack/react-query';
import type { UserDetailsResponse } from '../types/userType';

export const useGetUserById = (
  id: string | undefined,
  options?: Omit<UseQueryOptions<UserDetailsResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      if (!id) throw new Error('User ID is required');
      const response = await getUserById(id);
      return response.data;
    },
    enabled: !!id && (options?.enabled ?? true),
    ...options,
  });
};
