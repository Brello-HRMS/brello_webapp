import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateTimesheet } from '../api/timesheet';
import { showToast } from '../../ToastFeature/ShowToast';

import type { UpdateTimesheetParams } from '../types/timesheetType';
import type { ApiError } from '../../../types/common';

export const useUpdateTimesheet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTimesheetParams }) =>
      updateTimesheet(id, data),
    onSuccess: () => {
      showToast('Timesheet log updated successfully', 'success');
      void queryClient.invalidateQueries({ queryKey: ['timesheet-calendar'] });
      void queryClient.invalidateQueries({ queryKey: ['timesheet-dashboard'] });
    },
    onError: (error: ApiError) => {
      const message = error?.message || 'Failed to update timesheet entry';
      showToast(message, 'error');
    },
  });
};
