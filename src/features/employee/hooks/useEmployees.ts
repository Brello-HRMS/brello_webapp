import { useQuery } from '@tanstack/react-query';

import { getEmployees } from '../api/employee';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { UseQueryOptions } from '@tanstack/react-query';
import type { GetEmployeesParams, GetEmployeesResponse } from '../types/employeeType';

export const useEmployees = (
  params?: GetEmployeesParams,
  options?: Omit<UseQueryOptions<GetEmployeesResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['employees', params],
    queryFn: async () => {
      try {
        const data = await getEmployees(params);
        showToast('Employees fetched successfully', 'success');
        return data;
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to fetch employees';
        showToast(message, 'error');
        throw error;
      }
    },
    placeholderData: (previousData) => previousData,
    ...options,
  });
};
