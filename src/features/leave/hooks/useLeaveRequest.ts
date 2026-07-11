import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { leaveRequestApi } from '../api/leaveRequestApi';

import type { CreateLeaveRequestPayload } from '../types/leaveRequestTypes';

export const LEAVE_REQUEST_KEYS = {
  all: ['leave-requests'] as const,
  mine: (params?: Record<string, unknown>) => [...LEAVE_REQUEST_KEYS.all, 'mine', params] as const,
};

export const useMyLeaveRequests = (params?: { status?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: LEAVE_REQUEST_KEYS.mine(params),
    queryFn: async () => {
      const response = await leaveRequestApi.listMine(params);
      return {
        items: response.data.data,
        pagination: response.data.pagination,
      };
    },
  });
};

export const useCreateLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateLeaveRequestPayload) => {
      const response = await leaveRequestApi.createDraft(payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAVE_REQUEST_KEYS.all });
      toast.success('Leave request draft created');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to create leave request';
      toast.error(msg);
    },
  });
};

export const useSubmitLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await leaveRequestApi.submitDraft(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAVE_REQUEST_KEYS.all });
      toast.success('Leave request submitted for approval');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to submit leave request';
      toast.error(msg);
    },
  });
};

export const useCancelLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await leaveRequestApi.cancelMine(id, reason);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAVE_REQUEST_KEYS.all });
      toast.success('Leave request cancelled');
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to cancel leave request';
      toast.error(msg);
    },
  });
};
