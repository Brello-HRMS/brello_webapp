import { useQuery } from '@tanstack/react-query';

import { apiClient } from '../lib/axios';
import { envVars } from '../utils/envVars';
import { showToast } from '../features/ToastFeature/ShowToast';

import type { ApiError } from '../types/common';
import type { UseQueryOptions } from '@tanstack/react-query';

export interface EmployeeDropdownItem {
  name: string;
  id: string;
  profile?: string;
}

export interface EmployeeDropdownResponse {
  success: boolean;
  data: EmployeeDropdownItem[];
  timestamp: string;
}

export const getEmployeesDropdown = async (): Promise<EmployeeDropdownResponse> => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/employees/dropdown`);
};

export const useEmployeesDropdown = (
  options?: Omit<UseQueryOptions<EmployeeDropdownResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['employees', 'dropdown'],
    queryFn: async () => {
      try {
        const response = await getEmployeesDropdown();
        return response;
      } catch (error) {
        const message = (error as ApiError)?.message || 'Failed to fetch employees';
        showToast(message, 'error');
        throw error;
      }
    },
    ...options,
  });
};
