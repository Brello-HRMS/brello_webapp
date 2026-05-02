import { useQuery } from '@tanstack/react-query';

import { getRoles } from '../api/roles';

export const useRoles = (params?: { search?: string; app_id?: string; sort?: string }) => {
  return useQuery({
    queryKey: ['roles', params?.search, params?.app_id, params?.sort],
    queryFn: () => getRoles(params),
  });
};
