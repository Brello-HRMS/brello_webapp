import { apiClient } from '../lib/axios';
import { envVars } from '../utils/envVars';

export interface BalanceView {
  id: string | null;
  leave_type_id: string;
  leave_type_code: string | null;
  leave_type_name: string;
  is_unlimited: boolean;
  accrual?: string;
  allow_half_day?: boolean;
  allocated_days: number | null;
  accrued_days: number | null;
  carry_forward: number | null;
  adjustment: number | null;
  used_days: number;
  pending_days: number;
  consumed_days: number | null;
  available_days: number | null;
}

export interface EmployeeBalanceResponse {
  employee_id: string;
  leave_year: number;
  leave_cycle: { start: string; end: string };
  total_allocated: number;
  total_available: number;
  balances: BalanceView[];
}

export interface ListBalanceItem {
  employee_id: string;
  employee_name: string;
  employee_code: string | null;
  department_name: string | null;
  designation_name?: string | null;
  employee_avatar_url: string | null;
  total_allocated: number;
  total_available: number;
  balances: BalanceView[];
}

export interface ListBalanceResponse {
  data: ListBalanceItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface LedgerEntry {
  id: string;
  balance_id: string;
  type: string;
  direction: string;
  days: number;
  running_balance: number | null;
  reference_id: string | null;
  reason: string | null;
  created_at: Date;
  modified_by: string | null;
}

export interface LedgerResponse {
  data: LedgerEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface InitializeBalanceDto {
  employee_id: string;
  leave_year: number;
  carry_forward?: { leave_type_id: string; days: number }[];
}

export interface BulkInitializeDto {
  leave_year: number;
  scope: 'ORGANIZATION' | 'DEPARTMENT' | 'EMPLOYEES';
  department_ids?: string[];
  employee_ids?: string[];
  auto_carry_forward?: boolean;
}

export interface AdjustBalanceDto {
  direction: 'CREDIT' | 'DEBIT';
  days: number;
  reason?: string;
}

export const getMyLeaveBalance = async (leave_year?: number): Promise<EmployeeBalanceResponse> => {
  const params = leave_year ? { leave_year } : {};
  const response = await apiClient.get(`${envVars.BRELLO_BASE_API}/leave-balances/me`, { params });
  return response.data;
};

export const getEmployeeLeaveBalance = async (
  employee_id: string,
  leave_year?: number,
): Promise<EmployeeBalanceResponse> => {
  const params = leave_year ? { leave_year } : {};
  const response = await apiClient.get(
    `${envVars.BRELLO_BASE_API}/leave-balances/employee/${employee_id}`,
    { params },
  );
  return response.data;
};

export const initializeLeaveBalance = async (
  data: InitializeBalanceDto,
): Promise<{ employee_id: string; leave_year: number; balances: BalanceView[] }> => {
  const response = await apiClient.post(
    `${envVars.BRELLO_BASE_API}/leave-balances/initialize`,
    data,
  );
  return response.data;
};

export const bulkInitializeLeaveBalance = async (
  data: BulkInitializeDto,
): Promise<{ initialized_count: number; skipped: { employee_id: string; reason: string }[] }> => {
  const response = await apiClient.post(
    `${envVars.BRELLO_BASE_API}/leave-balances/initialize/bulk`,
    data,
  );
  return response.data;
};

export const listLeaveBalances = async (params: {
  leave_year?: number;
  page?: number;
  limit?: number;
  search?: string;
  department_id?: string;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}): Promise<ListBalanceResponse> => {
  const response = await apiClient.get(`${envVars.BRELLO_BASE_API}/leave-balances`, { params });
  return response.data;
};

export const getLeaveBalanceById = async (id: string): Promise<BalanceView> => {
  const response = await apiClient.get(`${envVars.BRELLO_BASE_API}/leave-balances/${id}`);
  return response.data;
};

export const getLeaveBalanceLedger = async (
  id: string,
  params: { page?: number; limit?: number; from_date?: string; to_date?: string },
): Promise<LedgerResponse> => {
  const response = await apiClient.get(`${envVars.BRELLO_BASE_API}/leave-balances/${id}/ledger`, {
    params,
  });
  return response.data;
};

export const adjustLeaveBalance = async (
  id: string,
  data: AdjustBalanceDto,
): Promise<{ id: string; available_days: number; ledger_entry_id: string }> => {
  const response = await apiClient.patch(
    `${envVars.BRELLO_BASE_API}/leave-balances/${id}/adjust`,
    data,
  );
  return response.data;
};

export const recomputeLeaveBalance = async (
  id: string,
): Promise<{
  id: string;
  before: { available_days: number | null; used_days: number; pending_days: number };
  after: { available_days: number | null; used_days: number; pending_days: number };
  drift_detected: boolean;
}> => {
  const response = await apiClient.post(
    `${envVars.BRELLO_BASE_API}/leave-balances/${id}/recompute`,
  );
  return response.data;
};

export const updateLeaveBalance = async (
  id: string,
  data: { allocated_days: number; reason: string },
): Promise<BalanceView> => {
  const response = await apiClient.patch(`${envVars.BRELLO_BASE_API}/leave-balances/${id}`, data);
  return response.data;
};
