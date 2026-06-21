import { useQuery } from '@tanstack/react-query';

import { getTimesheetDashboard } from '../api/timesheet';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';

export const useTimesheetDashboard = () => {
  return useQuery({
    queryKey: ['timesheet-dashboard'],
    queryFn: async () => {
      try {
        const data = await getTimesheetDashboard();
        return data;
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to fetch timesheet dashboard';
        showToast(message, 'error');
        throw error;
      }
    },
  });
};
