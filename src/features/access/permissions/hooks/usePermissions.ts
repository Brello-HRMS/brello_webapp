import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';

import { getRolePermissionsList, updateRolePermissionsList } from '../../../../api/moduleAccess';

interface ApiErrorResponse {
  message?: string;
}

export const useRolePermissionsQuery = (roleId: string) => {
  return useQuery({
    queryKey: ['role-permissions', roleId],
    queryFn: () => getRolePermissionsList(roleId).then((res) => res.data),
    enabled: !!roleId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateRolePermissionsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      permissions,
    }: {
      roleId: string;
      permissions: Array<{ module_id: string; action_id: string; checked: boolean }>;
    }) => updateRolePermissionsList(roleId, permissions),
    onSuccess: (_, variables) => {
      toast.success('Permissions updated successfully');
      queryClient.invalidateQueries({ queryKey: ['role-permissions', variables.roleId] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.message || 'Failed to update permissions');
    },
  });
};
