import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import * as payrollApi from '../api/payrollApi';

import type { AssignSalaryPayload, DryRunPayload } from '../types/payrollConfigTypes';

export const useEmployeeList = (params: {
  page: number;
  limit: number;
  search?: string;
  department_id?: string;
}) => {
  const query = useQuery({
    queryKey: ['payroll', 'employees', params],
    queryFn: () => payrollApi.getEmployeesList(params),
  });

  return {
    employees: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    page: query.data?.page ?? params.page,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useAssignSalary = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: AssignSalaryPayload) => payrollApi.assignEmployeeSalary(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll', 'employees'] });
      toast.success('Salary assigned successfully');
    },
    onError: () => {
      toast.error('Failed to assign salary');
    },
  });

  return {
    assignSalary: mutation.mutateAsync,
    isAssigning: mutation.isPending,
  };
};

export const useEmployeeSalaryStructure = (userId: string | null) => {
  const query = useQuery({
    queryKey: ['payroll', 'employee-salary-structure', userId],
    queryFn: () => payrollApi.getEmployeeSalaryStructure(userId!),
    enabled: !!userId,
  });

  return {
    salaryStructure: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

export const useDryRun = () => {
  const mutation = useMutation({
    mutationFn: (data: DryRunPayload) => payrollApi.runDryRun(data),
    onError: () => {
      toast.error('Salary preview failed. Check your inputs.');
    },
  });

  return {
    runDryRun: mutation.mutateAsync,
    dryRunResult: mutation.data,
    isCalculating: mutation.isPending,
    resetDryRun: mutation.reset,
  };
};
