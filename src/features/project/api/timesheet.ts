import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type {
  TimesheetDashboardResponse,
  TimesheetProjectsResponse,
  TimesheetCalendarResponse,
  CreateTimesheetParams,
  TimesheetMutationResponse,
  UpdateTimesheetParams,
} from '../types/timesheetType';

export const getTimesheetDashboard = async (): Promise<TimesheetDashboardResponse> => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/timesheet/dashboard`);
};

export const getTimesheetProjects = async (): Promise<TimesheetProjectsResponse> => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/timesheet/projects`);
};

export const getTimesheetCalendar = async (
  year: number,
  month: number,
): Promise<TimesheetCalendarResponse> => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/timesheet/calendar`, {
    params: { year, month },
  });
};

export const createTimesheet = async (
  data: CreateTimesheetParams,
): Promise<TimesheetMutationResponse> => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/timesheet`, data);
};

export const updateTimesheet = async (
  id: string,
  data: UpdateTimesheetParams,
): Promise<{ success: boolean }> => {
  return apiClient.patch(`${envVars.BRELLO_BASE_API}/timesheet/${id}`, data);
};

export const deleteTimesheet = async (id: string): Promise<{ success: boolean }> => {
  return apiClient.delete(`${envVars.BRELLO_BASE_API}/timesheet/${id}`);
};
