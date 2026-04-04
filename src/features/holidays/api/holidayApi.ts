import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type {
  CalendarResponse,
  SingleCalendarResponse,
  Holiday,
  HolidayResponse,
  MonthViewResponse,
  EmployeeHolidaysResponse,
  CreateCalendarRequest,
  AddHolidayRequest,
} from '../types';

// --- API Functions ---

export const getCalendars = async (year?: number): Promise<CalendarResponse> => {
  const url = year
    ? `${envVars.BRELLO_BASE_API}/holidays/calendars?year=${year}`
    : `${envVars.BRELLO_BASE_API}/holidays/calendars`;
  return apiClient.get(url);
};

export const createCalendar = async (
  data: CreateCalendarRequest,
): Promise<SingleCalendarResponse> => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/holidays/calendars`, data);
};

export const activateCalendar = async (id: string): Promise<SingleCalendarResponse> => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/holidays/calendars/${id}/activate`);
};

export const deleteCalendar = async (id: string): Promise<{ success: boolean }> => {
  return apiClient.delete(`${envVars.BRELLO_BASE_API}/holidays/calendars/${id}`);
};

export const getCalendarHolidays = async (
  id: string,
  month?: number,
): Promise<MonthViewResponse | HolidayResponse> => {
  const url =
    month !== undefined
      ? `${envVars.BRELLO_BASE_API}/holidays/calendars/${id}/month-view?month=${month}`
      : `${envVars.BRELLO_BASE_API}/holidays/calendars/${id}/holidays`;
  return apiClient.get(url);
};

export const addHoliday = async (
  id: string,
  data: AddHolidayRequest,
): Promise<{ success: boolean; data: Holiday }> => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/holidays/calendars/${id}/holidays`, data);
};

export const deleteHoliday = async (holidayId: string): Promise<{ success: boolean }> => {
  return apiClient.delete(`${envVars.BRELLO_BASE_API}/holidays/${holidayId}`);
};

export const getUpcomingHolidays = async (): Promise<EmployeeHolidaysResponse> => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/employee/holidays`);
};
