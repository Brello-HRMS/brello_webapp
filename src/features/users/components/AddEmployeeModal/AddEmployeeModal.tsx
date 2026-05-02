import React, { useState, useMemo } from 'react';

import { Dialog, Button, DataTable } from '../../../../components/common';
import { Input } from '../../../../components/ui/Input/Input';
import { useUsersList } from '../../hooks/useUsersList';
import { useMapUsers } from '../../hooks/useMapUsers';
import { useDebounce } from '../../../../hooks/useDebounce';
import { showToast } from '../../../../features/ToastFeature/ShowToast';

import styles from './AddEmployeeModal.module.scss';

import type { ColumnDef } from '@tanstack/react-table';
import type { User } from '../../types/userType';

interface AddEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  departmentId?: string;
  designationId?: string;
}

const selectableEmployeeColumns: ColumnDef<User>[] = [
  {
    id: 'name',
    header: 'Employee',
    size: 250,
    cell: (info) => {
      const user = info.row.original;
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim() || 'Unknown User';
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`;

      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
          <img
            src={avatarUrl}
            alt={fullName}
            style={{ width: '32px', height: '32px', borderRadius: '50%' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 500 }}>{fullName}</span>
            <span style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>
              {user.email || 'No email'}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 150,
    cell: (info) => {
      const status = info.getValue() as string;
      const isActive = status === 'ACTIVE';
      return (
        <span
          style={{
            color: isActive ? 'var(--color-primary-500)' : 'var(--color-warning-500)',
            fontWeight: 500,
          }}
        >
          {status || 'N/A'}
        </span>
      );
    },
  },
];

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  open,
  onClose,
  departmentId,
  designationId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data: usersResponse } = useUsersList();
  const { mutate: mapUsers, isPending: isMapping } = useMapUsers();

  const handleClose = () => {
    setSearchQuery('');
    setRowSelection({});
    setPagination({ pageIndex: 0, pageSize: 5 });
    onClose();
  };

  const filteredUsers = useMemo(() => {
    const allUsers = usersResponse?.data || [];

    // Users are now filtered or checked during submission to provide feedback
    // Instead of hiding them, we show them and validate on submit as per requirements.

    if (!debouncedSearchQuery) return allUsers;
    const query = debouncedSearchQuery.toLowerCase();

    return allUsers.filter((emp) => {
      const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
      return fullName.includes(query) || (emp.email || '').toLowerCase().includes(query);
    });
  }, [usersResponse, debouncedSearchQuery]);

  const selectedCount = Object.values(rowSelection).filter(Boolean).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);

    if (selectedIds.length === 0) {
      return;
    }

    const allUsers = usersResponse?.data || [];
    const validUserIds: string[] = [];

    selectedIds.forEach((id) => {
      const user = allUsers.find((u) => u.id === id);
      if (!user) return;

      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';

      if (departmentId && user.departmentId) {
        showToast(`${fullName} already belongs to this department`, 'error');
      } else if (designationId && user.designationId) {
        showToast(`${fullName} already has a designation`, 'error');
      } else {
        validUserIds.push(id);
      }
    });

    if (validUserIds.length === 0) {
      return;
    }

    mapUsers(
      {
        userIds: validUserIds,
        departmentId,
        designationId,
      },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  };

  const actions = (
    <div className={styles.actions}>
      <Button
        variant="secondary"
        onClick={handleClose}
        type="button"
        className={styles.cancelAction}
        disabled={isMapping}
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        type="button"
        className={styles.saveAction}
        isLoading={isMapping}
        disabled={selectedCount === 0}
      >
        {isMapping ? 'Mapping Users...' : `Map ${selectedCount} User(s)`}
      </Button>
    </div>
  );

  return (
    <Dialog
      title="Add Employees"
      open={open}
      onClose={handleClose}
      actions={actions}
      maxWidth="700px" // Slightly larger for DataTable
      position="right"
    >
      <div className={styles.contentContainer}>
        <div className={styles.searchContainer}>
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <DataTable
          columns={selectableEmployeeColumns}
          data={filteredUsers}
          pagination={pagination}
          onPaginationChange={setPagination}
          enableRowSelection
          rowSelection={rowSelection}
          onRowSelectionChange={setRowSelection}
          rowIdField="id"
        />
      </div>
    </Dialog>
  );
};
