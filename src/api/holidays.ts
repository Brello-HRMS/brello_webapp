import { apiClient } from '../lib/axios';
import { envVars } from '../utils/envVars';

const BASE = `${envVars.BRELLO_BASE_API}/employee/holidays`;

export interface HolidayItem {
  id: string;
  name: string;
  date: string; // ISO date string e.g. "2026-05-16"
  day: string; // "Monday", "Tuesday", etc.
  type: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

interface EmployeeHolidaysResponse {
  upcoming: HolidayItem[];
  all: HolidayItem[];
}

export const getHolidays = (year?: number): Promise<EmployeeHolidaysResponse> =>
  (
    apiClient.get(BASE, {
      params: { year: year ?? new Date().getFullYear() },
    }) as Promise<ApiEnvelope<EmployeeHolidaysResponse>>
  ).then((res) => res.data);
