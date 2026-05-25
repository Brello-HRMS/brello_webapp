import { useQuery } from '@tanstack/react-query';

import { getEmployeeAttendanceHistory } from '../../../api/attendance';
import { showToast } from '../../ToastFeature/ShowToast';

import type { AttendanceHistoryParams, AttendanceHistoryResponse } from '../../../api/attendance';
import type { ApiError } from '../../../types/common';

export const useEmployeeAttendanceHistory = (
  employeeId: string | undefined,
  params?: AttendanceHistoryParams,
) => {
  return useQuery<AttendanceHistoryResponse, Error>({
    queryKey: ['attendance', 'employee-history', employeeId, params],
    queryFn: async () => {
      try {
        return await getEmployeeAttendanceHistory(employeeId as string, params);
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to fetch attendance history';
        showToast(message, 'error');
        throw error;
      }
    },
    enabled: !!employeeId,
  });
};
