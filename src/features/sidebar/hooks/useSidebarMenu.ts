import { useQuery } from '@tanstack/react-query';

import { getMenu } from '../api/sidebar';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { MenuApiResponse } from '../types/sidebarType';

export const useSidebarMenu = (
  options?: Omit<UseQueryOptions<MenuApiResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['sidebar-menu'],
    queryFn: async () => {
      try {
        const data = await getMenu();
        return data;
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to fetch menu';
        showToast(message, 'error');
        throw error;
      }
    },
    ...options,
  });
};
