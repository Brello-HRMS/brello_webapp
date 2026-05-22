import { useQuery } from '@tanstack/react-query';

import { getAdminDailyPreview, type AdminDailyPreviewResponse } from '../../../api/attendance';
import { todayLocalDate } from '../../../utils/timeUtils';

import type { ApiError } from '../../../types/common';

export const useDailyAttendanceReport = () => {
  return useQuery<AdminDailyPreviewResponse | null>({
    queryKey: ['admin-daily-preview', todayLocalDate()],
    queryFn: async () => {
      try {
        const res = await getAdminDailyPreview(todayLocalDate());
        return res;
      } catch (error: unknown) {
        // If 403 Forbidden, gracefully return null
        if ((error as ApiError).response?.data?.statusCode === 403) {
          return null;
        }
        throw error;
      }
    },
    // Don't retry 403s
    retry: (failureCount, error: unknown) => {
      if ((error as ApiError).response?.data?.statusCode === 403) return false;
      return failureCount < 3;
    },
    refetchInterval: 5 * 60 * 1000, // refresh every 5 mins
  });
};
