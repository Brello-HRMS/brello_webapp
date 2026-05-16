import { apiClient } from '../lib/axios';
import { envVars } from '../utils/envVars';

const BASE = `${envVars.BRELLO_BASE_API}/employees`;

export interface BirthdayItem {
  id: string;
  name: string;
  employee_id: string | null;
  birth_day: number | null;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface NewHireItem {
  id: string;
  name: string;
  employee_id: string | null;
  department: string | null;
  joining_date: string | null; // formatted e.g. "May 16"
}

export const getBirthdays = (month?: number): Promise<BirthdayItem[]> =>
  (
    apiClient.get(`${BASE}/birthdays`, { params: month ? { month } : {} }) as Promise<
      ApiEnvelope<BirthdayItem[]>
    >
  ).then((res) => res.data);

export interface DashboardStats {
  total_employees: number;
  employee_trend: string; // e.g. "+2.0%"
  attendance_percent: string; // e.g. "92.5%"
  attendance_trend: string; // e.g. "+1.2%"
}

export const getNewHires = (): Promise<NewHireItem[]> =>
  (apiClient.get(`${BASE}/new-hires`) as Promise<ApiEnvelope<NewHireItem[]>>).then(
    (res) => res.data,
  );

export const getDashboardStats = (): Promise<DashboardStats> =>
  (apiClient.get(`${BASE}/stats`) as Promise<ApiEnvelope<DashboardStats>>).then((res) => res.data);
