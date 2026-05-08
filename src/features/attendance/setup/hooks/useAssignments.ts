import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getRuleAssignments,
  assignRuleToDepartments,
  assignRuleToEmployees,
} from '../../../../api/attendance';
import { showToast } from '../../../ToastFeature/ShowToast';
import { AssignmentType } from '../types/assignmentType.enum';

import type { IAssignment } from '../types/setupTypes';
import type { ApiError } from '../../../../types/common';

export const useAssignments = (ruleId: string) => {
  const queryClient = useQueryClient();

  const { data, isLoading: isLoadingAssignments } = useQuery({
    queryKey: ['rule_assignments', ruleId],
    queryFn: () => getRuleAssignments(ruleId),
    enabled: !!ruleId,
  });

  const assignments: IAssignment[] = data?.data?.data ?? data?.data ?? [];

  const assignedDeptIds = assignments
    .filter((a) => a.assignment_type === AssignmentType.DEPARTMENT)
    .map((a) => a.target_id);

  const assignedEmpIds = assignments
    .filter((a) => a.assignment_type === AssignmentType.EMPLOYEE)
    .map((a) => a.target_id);

  const deptMutation = useMutation({
    mutationFn: (department_ids: string[]) => assignRuleToDepartments(ruleId, department_ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rule_assignments', ruleId] });
      showToast('Departments assigned successfully', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.response?.data?.message || 'Failed to assign departments', 'error');
    },
  });

  const empMutation = useMutation({
    mutationFn: (employee_ids: string[]) => assignRuleToEmployees(ruleId, employee_ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rule_assignments', ruleId] });
      showToast('Employees assigned successfully', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.response?.data?.message || 'Failed to assign employees', 'error');
    },
  });

  return {
    assignments,
    assignedDeptIds,
    assignedEmpIds,
    isLoadingAssignments,
    assignDepartments: deptMutation.mutateAsync,
    assignEmployees: empMutation.mutateAsync,
    isAssigning: deptMutation.isPending || empMutation.isPending,
  };
};
