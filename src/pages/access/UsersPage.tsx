import React, { useState, useMemo, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

import { PageHeader, DataTable, ListControls } from '../../components/common';
import { useDebounce } from '../../hooks/useDebounce';
import { useAccessUsers } from '../../features/access/users/hooks/useAccessUsers';
import { accessUsersColumns } from '../../features/access/users/components/accessUsersColumns';
import { AddUserDialog } from '../../features/access/users/components/AddUserDialog';

import styles from './UsersPage.module.scss';

import type { AccessUser } from '../../features/access/users/types';

const UsersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AccessUser | null>(null);

  const { users, isLoading, assignRoles, updateRoles, removeUser, isAssigning, isUpdating } =
    useAccessUsers();

  const filteredUsers = useMemo(() => {
    if (!debouncedSearchQuery) return users;
    const query = debouncedSearchQuery.toLowerCase();
    return users.filter((u) => {
      const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
      return fullName.includes(query);
    });
  }, [users, debouncedSearchQuery]);

  const handleEdit = useCallback((user: AccessUser) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (user: AccessUser) => {
      const fullName = `${user.firstName} ${user.lastName}`.trim();
      if (window.confirm(`Are you sure you want to remove "${fullName}" from access control?`)) {
        await removeUser(user);
      }
    },
    [removeUser],
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
    <div className={styles.page}>
      <PageHeader
        title="User"
        subtitle="Manage users and assign roles."
        actions={
          <button className={styles.createButton} onClick={handleAddNew}>
            <span className={styles.plus}>+</span> Add User
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
          <DataTable columns={columns} data={filteredUsers} rowIdField="id" />
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
