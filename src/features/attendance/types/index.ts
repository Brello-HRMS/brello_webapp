export interface BackendEmployee {
  employee_id: string;
  name: string;
  emp_code: string | null;
  department: string | null;
}

export interface BackendShift {
  shift_name: string;
}

export interface DailyPreviewItem {
  attendance_id: string;
  employee: BackendEmployee;
  date: string;
  shift: BackendShift | null;
  check_in: string | null;
  check_out: string | null;
  worked_hours: string;
  attendance_mode: string;
  attendance_status: string;
  geo_status: string | null;
  distance_from_office_meters: number | null;
  source: string;
  remote_reason: string | null;
  notes: string | null;
}

export interface DailyPreviewSummary {
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

export interface DailyPreviewPagination {
  page: number;
  limit: number;
  total: number;
}

export interface DailyPreviewResponse {
  success: boolean;
  data: {
    summary: DailyPreviewSummary;
    items: DailyPreviewItem[];
    pagination: DailyPreviewPagination;
  };
  timestamp?: string;
}

export interface DailyPreviewParams {
  date?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface AttendanceCheckInPayload {
  employeeId?: string;
  date?: string;
  checkIn?: string;
  notes?: string;
}

export interface AttendanceCheckOutPayload {
  employeeId?: string;
  date?: string;
  checkOut?: string;
  notes?: string;
}

export interface AttendanceManualEntryPayload {
  employee_id: string;
  date: string;
  check_in: string;
  check_out: string;
  attendance_mode: 'OFFICE_IN' | 'REMOTE_IN';
  remote_reason: string | null;
  notes: string;
}
