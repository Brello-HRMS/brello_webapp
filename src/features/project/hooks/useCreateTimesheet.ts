import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createTimesheet } from '../api/timesheet';
import { showToast } from '../../ToastFeature/ShowToast';

import type { CreateTimesheetParams } from '../types/timesheetType';
import type { ApiError } from '../../../types/common';

export const useCreateTimesheet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTimesheetParams) => createTimesheet(data),
    onSuccess: () => {
      showToast('Timesheet log added successfully', 'success');
      void queryClient.invalidateQueries({ queryKey: ['timesheet-calendar'] });
      void queryClient.invalidateQueries({ queryKey: ['timesheet-dashboard'] });
    },
    onError: (error: ApiError) => {
      const message = error?.message || 'Failed to create timesheet entry';
      showToast(message, 'error');
    },
  });
};
