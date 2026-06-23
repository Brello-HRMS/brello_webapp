import { useQuery } from '@tanstack/react-query';

import { getTimesheetProjects } from '../api/timesheet';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';

export const useTimesheetProjects = () => {
  return useQuery({
    queryKey: ['timesheet-projects'],
    queryFn: async () => {
      try {
        const data = await getTimesheetProjects();
        return data;
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to fetch assigned projects';
        showToast(message, 'error');
        throw error;
      }
    },
  });
};
