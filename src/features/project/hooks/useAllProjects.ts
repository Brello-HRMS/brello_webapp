import { useQuery } from '@tanstack/react-query';

import { getAllProjects } from '../api/projectApi';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { GetProjectsResponse, GetProjectsParams } from '../types/projectType';

export const useAllProjects = (
  params?: GetProjectsParams,
  options?: Omit<UseQueryOptions<GetProjectsResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['projects', 'all', params],
    queryFn: async () => {
      try {
        const data = await getAllProjects(params);
        return data;
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to fetch projects';
        showToast(message, 'error');
        throw error;
      }
    },
    ...options,
  });
};
