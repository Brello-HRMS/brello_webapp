import { apiClient } from '../../../lib/axios';

import type {
  CreateLeaveRequestPayload,
  LeaveRequestListResponse,
  LeaveRequestResponse,
  ValidateLeaveRequestPayload,
  ValidateLeaveRequestResponse,
} from '../types/leaveRequestTypes';

export const leaveRequestApi = {
  createDraft: async (payload: CreateLeaveRequestPayload) => {
    return apiClient.post<LeaveRequestResponse>('/leave-requests', payload);
  },

  submitDraft: async (id: string) => {
    return apiClient.post<LeaveRequestResponse>(`/leave-requests/${id}/submit`);
  },

  validate: async (payload: ValidateLeaveRequestPayload) => {
    return apiClient.post<ValidateLeaveRequestResponse>('/leave-requests/validate', payload);
  },

  listMine: async (params?: { status?: string; page?: number; limit?: number }) => {
    return apiClient.get<LeaveRequestListResponse>('/leave-requests/me', { params });
  },

  cancelMine: async (id: string, reason: string) => {
    return apiClient.post<LeaveRequestResponse>(`/leave-requests/${id}/cancel`, {
      employee_reason: reason,
    });
  },
};
