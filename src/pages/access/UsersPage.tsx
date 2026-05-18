import React, { useState, useMemo, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

import { PageHeader, DataTable, ListControls, PermissionGate } from '../../components/common';
import { useDebounce } from '../../hooks/useDebounce';
import { useModuleAccess } from '../../hooks/useModuleAccess';
import { ModuleCode, ActionCode } from '../../enum/modules';
import { useAccessUsers } from '../../features/access/users/hooks/useAccessUsers';
import { accessUsersColumns } from '../../features/access/users/components/accessUsersColumns';
import { AddUserDialog } from '../../features/access/users/components/AddUserDialog';
import { useRoles } from '../../hooks/useRoles';

import styles from './UsersPage.module.scss';

import type { Role } from '../../features/access/roles/types';
import type { PaginationState } from '@tanstack/react-table';
import type { AccessUser } from '../../features/access/users/types';

const UsersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AccessUser | null>(null);
  const [sortValue, setSortValue] = useState('urm.created_at:DESC');
  const [selectedRole, setSelectedRole] = useState('');

  const { hasEditAccess, hasDeleteAccess } = useModuleAccess(ModuleCode.ACCESS_USERS);

  const { data: roles } = useRoles();

  const roleOptions = useMemo(() => {
    let list: Role[] = [];
    if (Array.isArray(roles?.data?.data)) {
      list = roles.data.data;
    } else if (Array.isArray(roles?.data)) {
      list = roles.data as unknown as Role[];
    }
    return list.map((r) => ({ label: r.name, value: r.id }));
  }, [roles]);

  const sortOptions = [
    { label: 'Recently Added', value: 'urm.created_at:DESC' },
    { label: 'Oldest First', value: 'urm.created_at:ASC' },
    { label: 'Name (A-Z)', value: 'user.first_name:ASC' },
    { label: 'Name (Z-A)', value: 'user.first_name:DESC' },
  ];

  const params = useMemo(() => {
    const [sort_by, sort_order] = sortValue.split(':');
    return {
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: debouncedSearchQuery,
      role_id: selectedRole || undefined,
      sort_by,
      sort_order: sort_order as 'ASC' | 'DESC',
    };
  }, [pagination, debouncedSearchQuery, sortValue, selectedRole]);

  const { users, meta, isLoading, assignRoles, updateRoles, removeUser, isAssigning, isUpdating } =
    useAccessUsers(params);

  const handleEdit = useCallback(
    (user: AccessUser) => {
      if (!hasEditAccess) return;
      setSelectedUser(user);
      setIsDialogOpen(true);
    },
    [hasEditAccess],
  );

  const handleDelete = useCallback(
    async (user: AccessUser) => {
      if (!hasDeleteAccess) return;
      const fullName = `${user.firstName} ${user.lastName}`.trim();
      if (window.confirm(`Are you sure you want to remove "${fullName}" from access control?`)) {
        await removeUser(user);
      }
    },
    [removeUser, hasDeleteAccess],
  );

  const columns = useMemo(
    () => accessUsersColumns({ onEdit: handleEdit, onDelete: handleDelete }),
    [handleEdit, handleDelete],
  );

  const handleAddNew = () => {
    setSelectedUser(null);
    setIsDialogOpen(true);
  };

  const handleDialogSubmit = async ({ userId, roleIds }: { userId: string; roleIds: string[] }) => {
    if (selectedUser) {
      await updateRoles({ user: selectedUser, newRoleIds: roleIds });
    } else {
      await assignRoles({ userId, roleIds });
    }
  };

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Manage users and assign roles."
        actions={
          <PermissionGate module={ModuleCode.ACCESS_USERS} action={ActionCode.CREATE}>
            <button className={styles.createButton} onClick={handleAddNew}>
              <span className={styles.plus}>+</span> Add User
            </button>
          </PermissionGate>
        }
      />

      <ListControls
        searchPlaceholder="Search employee name or ID..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showFilters={true}
        filterOptions={roleOptions}
        selectedFilter={selectedRole}
        onFilterChange={setSelectedRole}
        filterTitle="Filter by Role"
        showSort={true}
        sortOptions={sortOptions}
        selectedSort={sortValue}
        onSortChange={setSortValue}
        showViewSwitcher={false}
      />

      <div className={styles.tableContainer}>
        {isLoading ? (
          <div className={styles.loader}>
            <Loader2 className={styles.spin} size={28} />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={users}
            rowIdField="id"
            manualPagination
            pagination={pagination}
            onPaginationChange={setPagination}
            pageCount={meta?.totalPages || 0}
          />
        )}
      </div>

      <AddUserDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleDialogSubmit}
        initialData={selectedUser}
        isLoading={isAssigning || isUpdating}
      />
    </div>
  );
};

export default UsersPage;
