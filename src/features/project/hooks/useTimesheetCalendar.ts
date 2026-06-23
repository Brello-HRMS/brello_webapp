import { useQuery } from '@tanstack/react-query';

import { getTimesheetCalendar } from '../api/timesheet';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';

export const useTimesheetCalendar = (year: number, month: number) => {
  return useQuery({
    queryKey: ['timesheet-calendar', year, month],
    queryFn: async () => {
      try {
        const data = await getTimesheetCalendar(year, month);
        return data;
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to fetch calendar entries';
        showToast(message, 'error');
        throw error;
      }
    },
    enabled: typeof year === 'number' && typeof month === 'number',
  });
};
