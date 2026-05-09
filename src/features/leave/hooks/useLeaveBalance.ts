import { useQuery } from '@tanstack/react-query';

import { getEmployeeLeaveBalance } from '../api/leaveBalanceApi';

import type { LeaveBalanceResponse } from '../types/leaveBalanceTypes';

export const useLeaveBalance = (employeeId: string | undefined) => {
  return useQuery<LeaveBalanceResponse, Error>({
    queryKey: ['leave-balance', employeeId],
    queryFn: () => getEmployeeLeaveBalance(employeeId!),
    enabled: !!employeeId,
  });
};
