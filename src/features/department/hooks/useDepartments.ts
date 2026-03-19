import { useQuery } from '@tanstack/react-query';

import { getDepartments } from '../api/department';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { GetDepartmentsParams, GetDepartmentsResponse } from '../types/departmentType';

export const useDepartments = (
  params?: GetDepartmentsParams,
  options?: Omit<UseQueryOptions<GetDepartmentsResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['departments', params],
    queryFn: async () => {
      try {
        const data = await getDepartments(params);
        showToast('Departments fetched successfully', 'success');
        return data;
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to fetch departments';
        showToast(message, 'error');
        throw error;
      }
    },
    placeholderData: (previousData) => previousData,
    ...options,
  });
};
