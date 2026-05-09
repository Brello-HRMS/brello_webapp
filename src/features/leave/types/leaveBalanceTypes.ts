export interface LeaveCycle {
  start: string;
  end: string;
}

export interface LeaveBalanceRow {
  id: string;
  leave_type_id: string;
  leave_type_code: string;
  leave_type_name: string;
  is_unlimited: boolean;
  accrual: string;
  allow_half_day: boolean;
  allocated_days: number | null;
  accrued_days: number | null;
  carry_forward: number | null;
  adjustment: number | null;
  used_days: number;
  pending_days: number;
  consumed_days: number | null;
  available_days: number | null;
}

export interface LeaveBalanceData {
  employee_id: string;
  leave_year: number;
  leave_cycle: LeaveCycle;
  total_allocated: number;
  total_available: number;
  balances: LeaveBalanceRow[];
}

export interface LeaveBalanceResponse {
  success: boolean;
  data: LeaveBalanceData;
}
