import React, { useState, useMemo, useCallback } from 'react';

import { PageHeader, DataTable, ListControls, PermissionGate } from '../../components/common';
import { useDebounce } from '../../hooks/useDebounce';
import { useModuleAccess } from '../../hooks/useModuleAccess';
import { ModuleCode, ActionCode } from '../../enum/modules';
import { useRoles } from '../../features/access/roles/hooks/useRoles';
import { rolesColumns } from '../../features/access/roles/components/rolesColumns';
import { RoleDrawer } from '../../features/access/roles/components/RoleDrawer';
import { getAvailableApps } from '../../utils/authUtils';

import styles from './RolesPage.module.scss';

import type { Role, CreateRoleInput } from '../../features/access/roles/types';

const RolesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('createdAt_DESC');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const { hasEditAccess, hasDeleteAccess } = useModuleAccess(ModuleCode.ACCESS_ROLES);

  const availableApps = getAvailableApps();
  const filterOptions = [
    { label: 'All Apps', value: '' },
    ...availableApps.map((app) => ({ label: app.name, value: app.id })),
  ];

  const sortOptions = [
    { label: 'Name (A-Z)', value: 'name_ASC' },
    { label: 'Name (Z-A)', value: 'name_DESC' },
    { label: 'Newest First', value: 'createdAt_DESC' },
    { label: 'Oldest First', value: 'createdAt_ASC' },
  ];

  const { roles, isLoading, createRole, updateRole, deleteRole, isCreating, isUpdating } = useRoles(
    {
      search: debouncedSearchQuery || undefined,
      app_id: selectedAppId || undefined,
      sort: selectedSort || undefined,
    },
  );

  const handleEdit = useCallback(
    (role: Role) => {
      if (!hasEditAccess) return;
      setSelectedRole(role);
      setIsDrawerOpen(true);
    },
    [hasEditAccess],
  );

  const handleDelete = useCallback(
    async (role: Role) => {
      if (!hasDeleteAccess) return;
      if (window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
        await deleteRole(role.id);
      }
    },
    [deleteRole, hasDeleteAccess],
  );

  // Handlers include internal guards — rolesColumns requires non-optional callbacks
  const columns = useMemo(
    () => rolesColumns({ onEdit: handleEdit, onDelete: handleDelete }),
    [handleEdit, handleDelete],
  );

  const handleCreateNew = () => {
    setSelectedRole(null);
    setIsDrawerOpen(true);
  };

  const handleDrawerSubmit = async (data: CreateRoleInput) => {
    if (selectedRole) {
      await updateRole({ id: selectedRole.id, data });
    } else {
      await createRole(data);
    }
  };

  return (
    <div>
      <PageHeader
        title="Roles"
        subtitle="Define system roles and access levels."
        actions={
          <PermissionGate module={ModuleCode.ACCESS_ROLES} action={ActionCode.CREATE}>
            <button className={styles.createButton} onClick={handleCreateNew}>
              <span className={styles.plus}>+</span> Create role
            </button>
          </PermissionGate>
        }
      />

      <ListControls
        searchPlaceholder="Search roles..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showFilters={true}
        filterOptions={filterOptions}
        selectedFilter={selectedAppId}
        onFilterChange={setSelectedAppId}
        filterTitle="Filter by App"
        showSort={true}
        sortOptions={sortOptions}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
        showViewSwitcher={false}
      />

      <div className={styles.tableContainer}>
        {isLoading ? (
          <div className={styles.loader} />
        ) : (
          <DataTable columns={columns} data={roles} rowIdField="id" />
        )}
      </div>

      <RoleDrawer
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSubmit={handleDrawerSubmit}
        initialData={selectedRole}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
};

export default RolesPage;
