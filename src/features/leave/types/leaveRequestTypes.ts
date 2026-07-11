export type LeaveRequestStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED';

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type_id: string;
  from_date: string; // YYYY-MM-DD
  to_date: string; // YYYY-MM-DD
  total_days: number;
  reason: string;
  status: LeaveRequestStatus;
  is_half_day?: boolean;
  half_day_session?: 'MORNING' | 'AFTERNOON';
  created_at: string;
}

export interface CreateLeaveRequestPayload {
  leave_type_id: string;
  from_date: string; // YYYY-MM-DD
  to_date: string; // YYYY-MM-DD
  reason: string;
  is_half_day?: boolean;
  half_day_session?: 'MORNING' | 'AFTERNOON';
}

export type ValidateLeaveRequestPayload = CreateLeaveRequestPayload;

export interface ValidateLeaveRequestResponse {
  valid: boolean;
  total_days: number;
  errors?: string[];
}

export interface LeaveRequestResponse {
  success: boolean;
  data: LeaveRequest;
}

export interface LeaveRequestListResponse {
  success: boolean;
  data: LeaveRequest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
