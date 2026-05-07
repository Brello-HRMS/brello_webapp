import { apiClient } from '../lib/axios';
import { envVars } from '../utils/envVars';

export interface LeaveTypeDto {
  id?: string;
  name: string;
  days: number;
  accrual: string;
  allowHalfDay: boolean;
}

export interface LeaveRulesDto {
  approvalRequired: boolean;
  maxPerMonth?: number;
  allowHalfDay: boolean;
  allowBackdated: boolean;
  maxBackdatedDays?: number;
  sandwichRule: boolean;
}

export interface CreateLeaveConfigDto {
  totalLeave?: number;
}

export interface UpdateLeaveConfigDto {
  totalLeave?: number;
  leaveTypes?: LeaveTypeDto[];
  rules?: LeaveRulesDto;
}

export const getCurrentLeaveConfig = async () => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/leave-configs/current`);
};

export const createLeaveConfigDraft = async (data: CreateLeaveConfigDto) => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/leave-configs`, data);
};

export const updateLeaveConfig = async (id: string, data: UpdateLeaveConfigDto) => {
  return apiClient.put(`${envVars.BRELLO_BASE_API}/leave-configs/${id}`, data);
};

export const activateLeaveConfig = async (id: string) => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/leave-configs/${id}/activate`);
};
