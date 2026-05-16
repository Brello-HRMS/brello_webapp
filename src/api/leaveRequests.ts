import { apiClient } from '../lib/axios';

import type {
  LeaveRequestQuery,
  LeaveRequestResponse,
  LeaveRequestDetails,
} from '../types/leaveRequest';

export const getLeaveRequests = async (
  query?: LeaveRequestQuery,
): Promise<LeaveRequestResponse> => {
  const response = await apiClient.get('/leave-requests', { params: query });
  return response.data;
};

export const getPendingApprovals = async (
  query?: LeaveRequestQuery,
): Promise<LeaveRequestResponse> => {
  const response = await apiClient.get('/leave-requests/pending-approval', { params: query });
  return response.data;
};

export const getLeaveRequestDetails = async (id: string): Promise<LeaveRequestDetails> => {
  const response = await apiClient.get(`/leave-requests/${id}`);
  return response.data;
};

export const approveLeaveRequest = async (id: string, comment?: string): Promise<void> => {
  const response = await apiClient.post(`/leave-requests/${id}/approve`, { comment });
  return response.data;
};

export const rejectLeaveRequest = async (id: string, rejection_reason: string): Promise<void> => {
  const response = await apiClient.post(`/leave-requests/${id}/reject`, { rejection_reason });
  return response.data;
};
