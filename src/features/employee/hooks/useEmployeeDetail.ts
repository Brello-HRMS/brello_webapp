import { useQuery } from '@tanstack/react-query';

import { getEmployeeById } from '../api/employee';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';

export const useEmployeeDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: ['employee', id],
    queryFn: async () => {
      try {
        const data = await getEmployeeById(id as string);
        return data;
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to fetch employee details';
        showToast(message, 'error');
        throw error;
      }
    },
    enabled: !!id,
  });
};
