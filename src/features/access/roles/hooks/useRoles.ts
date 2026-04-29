import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { getRoles, createRole, updateRole, deleteRole } from '../../../../api/roles';
import { showToast } from '../../../ToastFeature/ShowToast';

import type { CreateRoleInput } from '../types';
import type { ApiError } from '../../../../types/common';

export const useRoles = (params?: { search?: string }) => {
  const queryClient = useQueryClient();

  const {
    data: rolesResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['roles', params?.search],
    queryFn: () => getRoles(params),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateRoleInput) => createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      showToast('Role created successfully', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.response?.data?.message || 'Failed to create role', 'error');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateRoleInput }) => updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      showToast('Role updated successfully', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.response?.data?.message || 'Failed to update role', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      showToast('Role deleted successfully', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.response?.data?.message || 'Failed to delete role', 'error');
    },
  });

  return {
    roles: rolesResponse?.data || [],
    isLoading,
    error,
    createRole: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateRole: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteRole: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};
