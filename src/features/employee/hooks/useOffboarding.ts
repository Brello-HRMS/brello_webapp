/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  initiateOffboarding,
  updateOffboarding,
  getOffboardingStatus,
  cancelOffboarding,
} from '../api/offboardingApi';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { InitiateOffboardingDto, UpdateOffboardingDto } from '../types/offboardingType';

export const useOffboardingStatus = (employeeId: string | undefined) => {
  return useQuery({
    queryKey: ['employeeOffboarding', employeeId],
    queryFn: async () => {
      if (!employeeId) return null;
      try {
        const response = await getOffboardingStatus(employeeId);
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          // A 404 means the employee is not currently offboarded. We return null gracefully.
          return null;
        }
        throw error;
      }
    },
    enabled: !!employeeId,
  });
};

export const useInitiateOffboarding = (employeeId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InitiateOffboardingDto) => {
      if (!employeeId) throw new Error('Employee ID is missing');
      return initiateOffboarding(employeeId, data);
    },
    onSuccess: () => {
      showToast('Offboarding initiated successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['employeeOffboarding', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
    },
    onError: (error: ApiError | any) => {
      const message =
        error?.response?.data?.message || error?.data?.message || 'Failed to initiate offboarding';
      showToast(message, 'error');
    },
  });
};

export const useUpdateOffboarding = (employeeId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateOffboardingDto) => {
      if (!employeeId) throw new Error('Employee ID is missing');
      return updateOffboarding(employeeId, data);
    },
    onSuccess: () => {
      showToast('Offboarding updated successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['employeeOffboarding', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
    },
    onError: (error: ApiError | any) => {
      const message =
        error?.response?.data?.message || error?.data?.message || 'Failed to update offboarding';
      showToast(message, 'error');
    },
  });
};

export const useCancelOffboarding = (employeeId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!employeeId) throw new Error('Employee ID is missing');
      return cancelOffboarding(employeeId);
    },
    onSuccess: () => {
      showToast('Offboarding cancelled successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['employeeOffboarding', employeeId] });
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
    },
    onError: (error: ApiError | any) => {
      const message =
        error?.response?.data?.message || error?.data?.message || 'Failed to cancel offboarding';
      showToast(message, 'error');
    },
  });
};
