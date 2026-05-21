export enum LeaveRequestStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export enum HalfDaySlot {
  FIRST_HALF = 'FIRST_HALF',
  SECOND_HALF = 'SECOND_HALF',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum LeaveRequestSortBy {
  SUBMITTED_AT = 'submitted_at',
  FROM_DATE = 'from_date',
}

export interface LeaveRequestQuery {
  status?: LeaveRequestStatus[];
  employee_id?: string;
  search?: string;
  department_id?: string;
  leave_type_id?: string;
  from_date?: string;
  to_date?: string;
  submitted_from?: string;
  submitted_to?: string;
  leave_year?: number;
  page?: number;
  limit?: number;
  sort_by?: LeaveRequestSortBy;
  sort_order?: SortOrder;
}

export interface LeaveRequestItem {
  id: string;
  employee_id: string;
  employee_code: string | null;
  employee_name: string;
  department_name: string | null;
  leave_type_name: string;
  from_date: string;
  to_date: string;
  total_days: number;
  status: LeaveRequestStatus;
  reason: string;
  manager_note: string | null;
  submitted_at: string | null;
}

export interface LeaveRequestResponse {
  data: LeaveRequestItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface LeaveRequestDetails extends LeaveRequestItem {
  leave_type: { id: string; name: string };
  is_half_day: boolean;
  half_day_slot: HalfDaySlot | null;
  attachment_ids: string[];
  approved_by: string | null;
  approved_by_name: string | null;
  approved_at: string | null;
  approver_comment: string | null;
  rejection_reason: string | null;
  cancelled_at: string | null;
  cancelled_by_admin: boolean;
}
