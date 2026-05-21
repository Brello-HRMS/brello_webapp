import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'react-toastify';

import { getRolePermissionsList, updateRolePermissionsList } from '../../../../api/moduleAccess';
import { PERMISSIONS_QUERY_KEY } from '../../../../hooks/useModuleAccess';

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

      // Refresh the editor's own checklist (background — isPending stays false so no flash)
      queryClient.invalidateQueries({ queryKey: ['role-permissions', variables.roleId] });

      // Mark the current user's effective-permissions cache stale without triggering an
      // immediate refetch of every live subscriber (PermissionGate / RequireAccess).
      // They will pick up fresh data on the next navigation or component mount.
      queryClient.invalidateQueries({
        queryKey: PERMISSIONS_QUERY_KEY,
        refetchType: 'none',
      });

      // Sidebar is a single component — refetch it immediately so menu items
      // appear / disappear right away.
      queryClient.invalidateQueries({ queryKey: ['sidebar-menu'] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.message || 'Failed to update permissions');
    },
  });
};
