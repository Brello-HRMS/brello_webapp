import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '../../ToastFeature/ShowToast';
import { getDailyPreview, checkIn, checkOut, manualEntry } from '../api/attendanceApi';

import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import type { ApiError } from '../../../types/common';
import type {
  DailyPreviewResponse,
  DailyPreviewParams,
  AttendanceCheckInPayload,
  AttendanceCheckOutPayload,
  AttendanceManualEntryPayload,
} from '../types';

export const useDailyPreview = (
  params?: DailyPreviewParams,
  options?: Omit<UseQueryOptions<DailyPreviewResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['attendance', 'daily-preview', params],
    queryFn: async () => {
      try {
        return await getDailyPreview(params);
      } catch (error) {
        const message = (error as unknown as ApiError)?.message || 'Failed to fetch daily preview';
        showToast(message, 'error');
        throw error;
      }
    },
    ...options,
  });
};

export const useCheckIn = (
  options?: UseMutationOptions<unknown, Error, AttendanceCheckInPayload>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkIn,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'daily-preview'] });
      showToast('Checked in successfully', 'success');
      options?.onSuccess?.(...args);
    },
    onError: (error) => {
      const message = (error as unknown as ApiError)?.message || 'Failed to check in';
      showToast(message, 'error');
    },
  });
};

export const useCheckOut = (
  options?: UseMutationOptions<unknown, Error, AttendanceCheckOutPayload>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkOut,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'daily-preview'] });
      showToast('Checked out successfully', 'success');
      options?.onSuccess?.(...args);
    },
    onError: (error) => {
      const message = (error as unknown as ApiError)?.message || 'Failed to check out';
      showToast(message, 'error');
    },
  });
};

export const useManualEntry = (
  options?: UseMutationOptions<unknown, Error, AttendanceManualEntryPayload>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: manualEntry,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'daily-preview'] });
      showToast('Manual entry saved successfully', 'success');
      options?.onSuccess?.(...args);
    },
    onError: (error) => {
      const message = (error as unknown as ApiError)?.message || 'Failed to save manual entry';
      showToast(message, 'error');
    },
  });
};
