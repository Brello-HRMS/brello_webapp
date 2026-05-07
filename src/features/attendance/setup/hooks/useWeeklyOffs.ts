import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getWeeklyOffs,
  createWeeklyOff,
  updateWeeklyOff,
  changeWeeklyOffStatus,
  deleteWeeklyOff,
} from '../../../../api/attendance';
import { showToast } from '../../../ToastFeature/ShowToast';

import type { IWeeklyOff, ICreateWeeklyOffForm } from '../types/setupTypes';
import type { ApiError } from '../../../../types/common';

export const useWeeklyOffs = (params?: { page?: number; limit?: number }) => {
  const queryClient = useQueryClient();

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['attendance_weekly_offs', params],
    queryFn: () => getWeeklyOffs(params),
  });

  const createMutation = useMutation({
    mutationFn: (data: ICreateWeeklyOffForm) => createWeeklyOff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance_weekly_offs'] });
      showToast('Weekly off created successfully', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.response?.data?.message || 'Failed to create weekly off', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ICreateWeeklyOffForm> }) =>
      updateWeeklyOff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance_weekly_offs'] });
      showToast('Weekly off updated successfully', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.response?.data?.message || 'Failed to update weekly off', 'error');
    },
  });

  const changeStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      changeWeeklyOffStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance_weekly_offs'] });
      showToast('Weekly off status updated', 'success');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteWeeklyOff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance_weekly_offs'] });
      showToast('Weekly off deleted successfully', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.response?.data?.message || 'Failed to delete weekly off', 'error');
    },
  });

  return {
    weeklyOffs: (response?.data?.data ?? []) as IWeeklyOff[],
    isLoading,
    error,
    createWeeklyOff: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateWeeklyOff: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    changeWeeklyOffStatus: changeStatusMutation.mutateAsync,
    isChangingStatus: changeStatusMutation.isPending,
    deleteWeeklyOff: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
