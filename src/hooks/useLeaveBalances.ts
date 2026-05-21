import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getMyLeaveBalance,
  getEmployeeLeaveBalance,
  initializeLeaveBalance,
  bulkInitializeLeaveBalance,
  listLeaveBalances,
  getLeaveBalanceById,
  getLeaveBalanceLedger,
  adjustLeaveBalance,
  recomputeLeaveBalance,
  updateLeaveBalance,
  type InitializeBalanceDto,
  type BulkInitializeDto,
  type AdjustBalanceDto,
} from '../api/leaveBalances';

export const LEAVE_BALANCES_KEYS = {
  all: ['leaveBalances'] as const,
  lists: () => [...LEAVE_BALANCES_KEYS.all, 'list'] as const,
  list: (params: Record<string, unknown>) => [...LEAVE_BALANCES_KEYS.lists(), params] as const,
  details: () => [...LEAVE_BALANCES_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...LEAVE_BALANCES_KEYS.details(), id] as const,
  myBalance: (year?: number) => [...LEAVE_BALANCES_KEYS.all, 'me', year] as const,
  employeeBalance: (id: string, year?: number) =>
    [...LEAVE_BALANCES_KEYS.all, 'employee', id, year] as const,
  ledgers: () => [...LEAVE_BALANCES_KEYS.all, 'ledger'] as const,
  ledger: (id: string, params: Record<string, unknown>) =>
    [...LEAVE_BALANCES_KEYS.ledgers(), id, params] as const,
};

export const useMyLeaveBalance = (leave_year?: number) => {
  return useQuery({
    queryKey: LEAVE_BALANCES_KEYS.myBalance(leave_year),
    queryFn: () => getMyLeaveBalance(leave_year),
  });
};

export const useEmployeeLeaveBalance = (employee_id: string, leave_year?: number) => {
  return useQuery({
    queryKey: LEAVE_BALANCES_KEYS.employeeBalance(employee_id, leave_year),
    queryFn: () => getEmployeeLeaveBalance(employee_id, leave_year),
    enabled: !!employee_id,
  });
};

export const useLeaveBalances = (params: {
  leave_year?: number;
  page?: number;
  limit?: number;
  search?: string;
  department_id?: string;
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';
}) => {
  return useQuery({
    queryKey: LEAVE_BALANCES_KEYS.list(params),
    queryFn: () => listLeaveBalances(params),
  });
};

export const useLeaveBalance = (id: string) => {
  return useQuery({
    queryKey: LEAVE_BALANCES_KEYS.detail(id),
    queryFn: () => getLeaveBalanceById(id),
    enabled: !!id,
  });
};

export const useLeaveBalanceLedger = (
  id: string,
  params: { page?: number; limit?: number; from_date?: string; to_date?: string },
) => {
  return useQuery({
    queryKey: LEAVE_BALANCES_KEYS.ledger(id, params),
    queryFn: () => getLeaveBalanceLedger(id, params),
    enabled: !!id,
  });
};

export const useInitializeBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InitializeBalanceDto) => initializeLeaveBalance(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: LEAVE_BALANCES_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: LEAVE_BALANCES_KEYS.employeeBalance(variables.employee_id, variables.leave_year),
      });
    },
  });
};

export const useBulkInitializeBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkInitializeDto) => bulkInitializeLeaveBalance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LEAVE_BALANCES_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: LEAVE_BALANCES_KEYS.details() });
    },
  });
};

export const useAdjustBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdjustBalanceDto }) =>
      adjustLeaveBalance(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: LEAVE_BALANCES_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: LEAVE_BALANCES_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: LEAVE_BALANCES_KEYS.ledgers() });
    },
  });
};

export const useRecomputeBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recomputeLeaveBalance(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: LEAVE_BALANCES_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: LEAVE_BALANCES_KEYS.lists() });
    },
  });
};

export const useUpdateLeaveBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { allocated_days: number; reason: string } }) =>
      updateLeaveBalance(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: LEAVE_BALANCES_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: LEAVE_BALANCES_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: LEAVE_BALANCES_KEYS.ledgers() });
    },
  });
};
