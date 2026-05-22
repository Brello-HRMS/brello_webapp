import { apiClient } from '../lib/axios';
import { envVars } from '../utils/envVars';

import type {
  ICreateShiftForm,
  ICreateWeeklyOffForm,
  ICreateRuleForm,
} from '../features/attendance/setup/types/setupTypes';

const BASE = `${envVars.BRELLO_BASE_API}/attendance`;

// --- Types ---
export interface TodayAttendance {
  attendance_id: string | null;
  attendance_session_id: string | null;
  date: string;
  attendance_mode: string | null;
  attendance_status: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  worked_duration_live: string;
  live_session: boolean;
  shift: { shift_name: string; start_time: string; end_time: string } | null;
  office: { office_name: string } | null;
}

export interface CheckInPayload {
  latitude?: number;
  longitude?: number;
  device?: 'WEB' | 'MOBILE';
  remote_reason?: string;
  notes?: string;
}

export interface CheckOutPayload {
  latitude?: number;
  longitude?: number;
  notes?: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

// --- Attendance Actions ---
export interface PreCheckResponse {
  is_late: boolean;
  late_minutes: number;
  is_remote: boolean;
  require_remote_reason: boolean;
  distance_meters: number | null;
  office_name: string | null;
  office_latitude: number | null;
  office_longitude: number | null;
  radius_meters: number | null;
  shift_start: string | null;
  current_time: string;
}

export const preCheckCheckIn = (latitude?: number, longitude?: number): Promise<PreCheckResponse> =>
  (
    apiClient.get(`${BASE}/check-in/pre-check`, {
      params: { latitude, longitude },
    }) as Promise<ApiEnvelope<PreCheckResponse>>
  ).then((res) => res.data);

export const clockIn = (data: CheckInPayload = {}): Promise<unknown> =>
  apiClient.post(`${BASE}/check-in`, data);

export const clockOut = (data: CheckOutPayload = {}): Promise<unknown> =>
  apiClient.post(`${BASE}/check-out`, data);

export const getTodayAttendance = (): Promise<TodayAttendance> =>
  (apiClient.get(`${BASE}/me/today`) as Promise<ApiEnvelope<TodayAttendance>>).then(
    (res) => res.data,
  );

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

// --- Admin ---
export interface DailySummary {
  present: number;
  absent: number;
  late: number;
  half_day: number;
  on_leave: number;
  missed_checkout: number;
  office_in: number;
  remote_in: number;
  geo_violations: number;
}

export interface AdminDailyPreviewResponse {
  summary: DailySummary;
  items: unknown[];
  pagination: { page: number; limit: number; total: number };
}

export const getAdminDailyPreview = (date: string): Promise<AdminDailyPreviewResponse> =>
  (
    apiClient.get(`${BASE}/admin/daily-preview`, { params: { date, limit: 1 } }) as Promise<
      ApiEnvelope<AdminDailyPreviewResponse>
    >
  ).then((res) => res.data);
