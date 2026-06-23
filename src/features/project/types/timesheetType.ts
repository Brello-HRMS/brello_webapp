export interface TimesheetProject {
  project_id: string;
  project_name: string;
}

export interface TimesheetDashboardData {
  project_count: number;
  hours_this_week: string;
  hours_this_month: string;
  assigned_projects: TimesheetProject[];
}

export interface TimesheetDashboardResponse {
  success: boolean;
  data: TimesheetDashboardData;
  timestamp: string;
}

export interface TimesheetProjectsResponse {
  success: boolean;
  data: TimesheetProject[];
  timestamp: string;
}

export interface TimesheetCalendarEntry {
  id: string;
  project_id: string;
  project_name: string;
  start_time: string;
  end_time: string;
  worked_minutes: number;
  worked_hours: string;
  task_description: string;
  note: string | null;
  submission_status: string;
}

export interface TimesheetCalendarGrouped {
  date: string;
  entries: TimesheetCalendarEntry[];
}

export interface TimesheetCalendarData {
  year: number;
  month: number;
  calendar: TimesheetCalendarGrouped[];
}

export interface TimesheetCalendarResponse {
  success: boolean;
  data: TimesheetCalendarData;
  timestamp: string;
}

export interface CreateTimesheetParams {
  project_id: string;
  entry_date: string;
  start_time: string;
  end_time: string;
  task_description: string;
  note?: string;
}

export interface UpdateTimesheetParams {
  project_id?: string;
  entry_date?: string;
  start_time?: string;
  end_time?: string;
  task_description?: string;
  note?: string | null;
}

export interface TimesheetMutationResponse {
  success: boolean;
  data: {
    timesheet_id: string;
    submission_status: string;
    worked_minutes: number;
    worked_hours: number;
  };
  timestamp: string;
}
