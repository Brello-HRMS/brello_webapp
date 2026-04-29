import React, { useState, useMemo, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

import { PageHeader, DataTable, ListControls } from '../../components/common';
import { useDebounce } from '../../hooks/useDebounce';
import { useRoles } from '../../features/access/roles/hooks/useRoles';
import { rolesColumns } from '../../features/access/roles/components/rolesColumns';
import { RoleDrawer } from '../../features/access/roles/components/RoleDrawer';

import styles from './RolesPage.module.scss';

import type { Role, CreateRoleInput } from '../../features/access/roles/types';

const RolesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const { roles, isLoading, createRole, updateRole, deleteRole, isCreating, isUpdating } = useRoles(
    {
      search: debouncedSearchQuery || undefined,
    },
  );

  const handleEdit = useCallback((role: Role) => {
    setSelectedRole(role);
    setIsDrawerOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (role: Role) => {
      if (window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
        await deleteRole(role.id);
      }
    },
    [deleteRole],
  );

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
    <div className={styles.page}>
      <PageHeader
        title="Roles"
        subtitle="Define system roles and access levels."
        actions={
          <button className={styles.createButton} onClick={handleCreateNew}>
            <span className={styles.plus}>+</span> Create role
          </button>
        }
      />

      <ListControls
        searchPlaceholder="Search employee name or ID..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showFilters={false}
        showSort={false}
        showViewSwitcher={false}
      />

      <div className={styles.tableContainer}>
        {isLoading ? (
          <div className={styles.loader}>
            <Loader2 className={styles.spin} size={28} />
          </div>
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
