import { useQuery } from '@tanstack/react-query';

import { getAvailableApps } from './auth';

import type { Apps } from './authType';

export const useAvailableApps = () => {
  return useQuery<Apps[]>({
    queryKey: ['auth', 'available-apps'],
    queryFn: async () => {
      const res = await getAvailableApps();
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
