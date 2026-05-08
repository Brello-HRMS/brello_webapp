import { apiClient } from '../lib/axios';
import { envVars } from '../utils/envVars';

import type {
  ICreateShiftForm,
  ICreateWeeklyOffForm,
  ICreateRuleForm,
} from '../features/attendance/setup/types/setupTypes';

const BASE = `${envVars.BRELLO_BASE_API}/attendance`;

// --- Shifts ---
export const getShifts = (params?: { page?: number; limit?: number }) =>
  apiClient.get(`${BASE}/shifts`, { params });

export const createShift = (data: ICreateShiftForm) => apiClient.post(`${BASE}/shifts`, data);

export const updateShift = (id: string, data: Partial<ICreateShiftForm>) =>
  apiClient.patch(`${BASE}/shifts/${id}`, data);

export const changeShiftStatus = (id: string, status: string) =>
  apiClient.patch(`${BASE}/shifts/${id}/status`, { status });

export const deleteShift = (id: string) => apiClient.delete(`${BASE}/shifts/${id}`);

// --- Weekly Offs ---
export const getWeeklyOffs = (params?: { page?: number; limit?: number }) =>
  apiClient.get(`${BASE}/weekly-offs`, { params });

export const createWeeklyOff = (data: ICreateWeeklyOffForm) =>
  apiClient.post(`${BASE}/weekly-offs`, data);

export const updateWeeklyOff = (id: string, data: Partial<ICreateWeeklyOffForm>) =>
  apiClient.patch(`${BASE}/weekly-offs/${id}`, data);

export const changeWeeklyOffStatus = (id: string, status: string) =>
  apiClient.patch(`${BASE}/weekly-offs/${id}/status`, { status });

export const deleteWeeklyOff = (id: string) => apiClient.delete(`${BASE}/weekly-offs/${id}`);

// --- Rules ---
export const getRules = (params?: { page?: number; limit?: number }) =>
  apiClient.get(`${BASE}/rules`, { params });

export const createRule = (data: ICreateRuleForm) => apiClient.post(`${BASE}/rules`, data);

export const updateRule = (id: string, data: Partial<ICreateRuleForm>) =>
  apiClient.patch(`${BASE}/rules/${id}`, data);

export const changeRuleStatus = (id: string, status: string) =>
  apiClient.patch(`${BASE}/rules/${id}/status`, { status });

export const deleteRule = (id: string) => apiClient.delete(`${BASE}/rules/${id}`);

// --- Assignments ---
export const getRuleAssignments = (ruleId: string) =>
  apiClient.get(`${BASE}/rules/${ruleId}/assignments`);

export const assignRuleToDepartments = (ruleId: string, department_ids: string[]) =>
  apiClient.post(`${BASE}/rules/${ruleId}/assign/departments`, { department_ids });

export const assignRuleToEmployees = (ruleId: string, employee_ids: string[]) =>
  apiClient.post(`${BASE}/rules/${ruleId}/assign/employees`, { employee_ids });
