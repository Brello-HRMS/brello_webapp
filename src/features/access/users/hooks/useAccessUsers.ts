import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { getUserRoleMaps, createUserRoleMap, deleteUserRoleMap } from '../../../../api/accessUsers';
import { getUsers } from '../../../users/api/user';
import { getDepartments } from '../../../department/api/department';
import { getOrganizationId } from '../../../../utils/authUtils';
import { showToast } from '../../../ToastFeature/ShowToast';

import type { AccessUser, AssignRolesInput } from '../types';
import type { ApiError } from '../../../../types/common';

export const useAccessUsers = () => {
  const queryClient = useQueryClient();
  const organizationId = getOrganizationId();

  const { data: roleMapsResponse, isLoading: isLoadingMaps } = useQuery({
    queryKey: ['user-role-maps'],
    queryFn: getUserRoleMaps,
  });

  const { data: usersResponse, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['usersList'],
    queryFn: getUsers,
  });

  const { data: deptResponse } = useQuery({
    queryKey: ['departments', { limit: 100 }],
    queryFn: () => getDepartments({ limit: 100 }),
  });

  const deptNameMap = useMemo(() => {
    const departments = deptResponse?.data?.data || [];
    return new Map(departments.map((d) => [d.id, d.name]));
  }, [deptResponse?.data?.data]);

  const users: AccessUser[] = useMemo(() => {
    const roleMaps = roleMapsResponse?.data || [];
    const usersList = usersResponse?.data || [];
    const grouped = new Map<string, AccessUser>();

    for (const map of roleMaps) {
      if (!grouped.has(map.user_id)) {
        const userInfo = usersList.find((u) => u.id === map.user_id);
        grouped.set(map.user_id, {
          id: map.user_id,
          firstName: userInfo?.firstName || 'Unknown',
          lastName: userInfo?.lastName || '',
          department: deptNameMap.get(userInfo?.departmentId || '') || '—',
          assignedRoles: [],
        });
      }

      grouped.get(map.user_id)!.assignedRoles.push({
        id: map.role_id,
        name: map.role?.name || '',
        mappingId: map.id,
      });
    }

    return Array.from(grouped.values());
  }, [roleMapsResponse?.data, usersResponse?.data, deptNameMap]);

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
    isLoading: isLoadingMaps || isLoadingUsers,
    assignRoles: assignRoles.mutateAsync,
    isAssigning: assignRoles.isPending,
    updateRoles: updateRoles.mutateAsync,
    isUpdating: updateRoles.isPending,
    removeUser: removeUser.mutateAsync,
    isRemoving: removeUser.isPending,
  };
};
