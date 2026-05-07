import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getRules,
  createRule,
  updateRule,
  changeRuleStatus,
  deleteRule,
} from '../../../../api/attendance';
import { showToast } from '../../../ToastFeature/ShowToast';

import type { IRule, ICreateRuleForm } from '../types/setupTypes';
import type { ApiError } from '../../../../types/common';

export const useRules = (params?: { page?: number; limit?: number }) => {
  const queryClient = useQueryClient();

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['attendance_rules', params],
    queryFn: () => getRules(params),
  });

  const createMutation = useMutation({
    mutationFn: (data: ICreateRuleForm) => createRule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance_rules'] });
      showToast('Rule created successfully', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.response?.data?.message || 'Failed to create rule', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ICreateRuleForm> }) =>
      updateRule(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance_rules'] });
      showToast('Rule updated successfully', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.response?.data?.message || 'Failed to update rule', 'error');
    },
  });

  const changeStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => changeRuleStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance_rules'] });
      showToast('Rule status updated', 'success');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance_rules'] });
      showToast('Rule deleted successfully', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.response?.data?.message || 'Failed to delete rule', 'error');
    },
  });

  return {
    rules: (response?.data?.data ?? []) as IRule[],
    isLoading,
    error,
    createRule: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateRule: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    changeRuleStatus: changeStatusMutation.mutateAsync,
    isChangingStatus: changeStatusMutation.isPending,
    deleteRule: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
