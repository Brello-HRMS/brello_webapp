import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getShifts,
  createShift,
  updateShift,
  changeShiftStatus,
  deleteShift,
} from '../../../../api/attendance';
import { showToast } from '../../../ToastFeature/ShowToast';

import type { IShift, ICreateShiftForm } from '../types/setupTypes';
import type { ApiError } from '../../../../types/common';

export const useShifts = (params?: { page?: number; limit?: number }) => {
  const queryClient = useQueryClient();

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['attendance_shifts', params],
    queryFn: () => getShifts(params),
  });

  const createMutation = useMutation({
    mutationFn: (data: ICreateShiftForm) => createShift(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance_shifts'] });
      showToast('Shift created successfully', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.response?.data?.message || 'Failed to create shift', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ICreateShiftForm> }) =>
      updateShift(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance_shifts'] });
      showToast('Shift updated successfully', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.response?.data?.message || 'Failed to update shift', 'error');
    },
  });

  const changeStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => changeShiftStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance_shifts'] });
      showToast('Shift status updated', 'success');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteShift(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance_shifts'] });
      showToast('Shift deleted successfully', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.response?.data?.message || 'Failed to delete shift', 'error');
    },
  });

  return {
    shifts: (response?.data?.data ?? []) as IShift[],
    isLoading,
    error,
    createShift: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateShift: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    changeShiftStatus: changeStatusMutation.mutateAsync,
    isChangingStatus: changeStatusMutation.isPending,
    deleteShift: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
