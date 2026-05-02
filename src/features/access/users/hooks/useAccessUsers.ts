import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getUserRoleMaps,
  createUserRoleMap,
  deleteUserRoleMap,
  type UserRoleMapItem,
} from '../../../../api/accessUsers';
import { getOrganizationId } from '../../../../utils/authUtils';
import { showToast } from '../../../ToastFeature/ShowToast';

import type { AccessUser, AssignRolesInput } from '../types';
import type { ApiError } from '../../../../types/common';

export const useAccessUsers = (params?: Record<string, string | number | undefined>) => {
  const queryClient = useQueryClient();
  const organizationId = getOrganizationId();

  const { data: roleMapsResponse, isLoading } = useQuery({
    queryKey: ['user-role-maps', params],
    queryFn: () => getUserRoleMaps(params),
  });

  const users: AccessUser[] = useMemo(() => {
    let list: UserRoleMapItem[] = [];

    if (Array.isArray(roleMapsResponse?.data?.data)) {
      list = roleMapsResponse.data.data;
    } else if (Array.isArray(roleMapsResponse?.data)) {
      list = roleMapsResponse.data as unknown as UserRoleMapItem[];
    }

    const grouped = new Map<string, AccessUser>();

    for (const map of list) {
      if (!grouped.has(map.user_id)) {
        const u = map.user;
        grouped.set(map.user_id, {
          id: map.user_id,
          firstName: u?.first_name || 'Unknown',
          lastName: u?.last_name || '',
          department: u?.department?.name || '—',
          assignedRoles: [],
        });
      }

      const user = grouped.get(map.user_id);
      if (user) {
        user.assignedRoles.push({
          id: map.role_id,
          name: map.role?.name || '',
          mappingId: map.id,
        });
      }
    }

    return Array.from(grouped.values());
  }, [roleMapsResponse]);

  const assignRoles = useMutation({
    mutationFn: async ({ userId, roleIds }: AssignRolesInput) => {
      if (!organizationId) throw new Error('Organization ID not found');
      await Promise.all(
        roleIds.map((role_id) =>
          createUserRoleMap({ user_id: userId, role_id, organization_id: organizationId }),
        ),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-role-maps'] });
      showToast('User added successfully', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || error?.message || 'Failed to add user', 'error');
    },
  });

  const updateRoles = useMutation({
    mutationFn: async ({ user, newRoleIds }: { user: AccessUser; newRoleIds: string[] }) => {
      if (!organizationId) throw new Error('Organization ID not found');

      const existingRoleIds = user.assignedRoles.map((r) => r.id);
      const toRemove = user.assignedRoles.filter((r) => !newRoleIds.includes(r.id));
      const toAdd = newRoleIds.filter((id) => !existingRoleIds.includes(id));

      await Promise.all([
        ...toRemove.map((r) => deleteUserRoleMap(r.mappingId)),
        ...toAdd.map((role_id) =>
          createUserRoleMap({ user_id: user.id, role_id, organization_id: organizationId }),
        ),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-role-maps'] });
      showToast('User roles updated successfully', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || error?.message || 'Failed to update roles', 'error');
    },
  });

  const removeUser = useMutation({
    mutationFn: async (user: AccessUser) => {
      await Promise.all(user.assignedRoles.map((r) => deleteUserRoleMap(r.mappingId)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-role-maps'] });
      showToast('User removed from access control', 'success');
    },
    onError: (error: ApiError) => {
      showToast(error?.data?.message || error?.message || 'Failed to remove user', 'error');
    },
  });

  return {
    users,
    isLoading,
    meta: roleMapsResponse?.data?.meta,

    assignRoles: assignRoles.mutateAsync,
    isAssigning: assignRoles.isPending,
    updateRoles: updateRoles.mutateAsync,
    isUpdating: updateRoles.isPending,
    removeUser: removeUser.mutateAsync,
    isRemoving: removeUser.isPending,
  };
};
