import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getLeaveRequests,
  getPendingApprovals,
  getLeaveRequestDetails,
  approveLeaveRequest,
  rejectLeaveRequest,
} from '../api/leaveRequests';

import type { LeaveRequestQuery } from '../types/leaveRequest';

export const useLeaveRequests = (query?: LeaveRequestQuery) => {
  return useQuery({
    queryKey: ['leaveRequests', query],
    queryFn: () => getLeaveRequests(query),
  });
};

export const usePendingApprovals = (query?: LeaveRequestQuery) => {
  return useQuery({
    queryKey: ['leaveRequests', 'pending', query],
    queryFn: () => getPendingApprovals(query),
  });
};

export const useLeaveRequestDetails = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ['leaveRequest', id],
    queryFn: () => getLeaveRequestDetails(id),
    enabled: !!id && enabled,
  });
};

export const useApproveLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      approveLeaveRequest(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalances'] });
    },
  });
};

export const useRejectLeaveRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, rejection_reason }: { id: string; rejection_reason: string }) =>
      rejectLeaveRequest(id, rejection_reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaveRequests'] });
      queryClient.invalidateQueries({ queryKey: ['leaveBalances'] });
    },
  });
};
