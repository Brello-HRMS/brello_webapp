import { apiClient } from '../../../lib/axios';

import type { LeaveBalanceResponse } from '../types/leaveBalanceTypes';

export const getEmployeeLeaveBalance = async (
  employeeId: string,
): Promise<LeaveBalanceResponse> => {
  return apiClient.get<LeaveBalanceResponse>(`/leave-balances/employee/${employeeId}`);
};
