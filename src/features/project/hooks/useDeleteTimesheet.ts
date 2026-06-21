import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteTimesheet } from '../api/timesheet';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';

export const useDeleteTimesheet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTimesheet(id),
    onSuccess: () => {
      showToast('Timesheet log deleted successfully', 'success');
      void queryClient.invalidateQueries({ queryKey: ['timesheet-calendar'] });
      void queryClient.invalidateQueries({ queryKey: ['timesheet-dashboard'] });
    },
    onError: (error: ApiError) => {
      const message = error?.message || 'Failed to delete timesheet entry';
      showToast(message, 'error');
    },
  });
};
