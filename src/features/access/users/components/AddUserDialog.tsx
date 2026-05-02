import React, { useState } from 'react';

import { Button, Dialog, Select } from '../../../../components/common';
import { MultiSelect } from '../../../../components/common/MultiSelect/MultiSelect';
import { useEmployeesDropdown } from '../../../../hooks/useEmployees';
import { useRoles } from '../../roles/hooks/useRoles';

import type { AccessUser } from '../types';
import type { Role } from '../../roles/types';

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { userId: string; roleIds: string[] }) => Promise<void>;
  initialData?: AccessUser | null;
  isLoading?: boolean;
}

export const AddUserDialog: React.FC<AddUserDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}) => {
  const [userId, setUserId] = useState('');
  const [roleIds, setRoleIds] = useState<(string | number)[]>([]);

  const { data: employeesResponse } = useEmployeesDropdown();
  const { roles } = useRoles();

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevInitialData, setPrevInitialData] = useState(initialData);

  if (open !== prevOpen || initialData !== prevInitialData) {
    setPrevOpen(open);
    setPrevInitialData(initialData);
    if (open) {
      if (initialData) {
        setUserId(initialData.id);
        setRoleIds(initialData.assignedRoles.map((r) => r.id));
      } else {
        setUserId('');
        setRoleIds([]);
      }
    }
  }

  const employeeOptions = (employeesResponse?.data || []).map((emp) => ({
    value: emp.id,
    label: emp.name,
  }));

  const roleList: Role[] = Array.isArray(roles)
    ? roles
    : ((roles as { data?: Role[] })?.data ?? []);
  const roleOptions = roleList.map((role) => ({ value: role.id, label: role.name }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ userId, roleIds: roleIds as string[] });
    onClose();
  };

  const actions = (
    <>
      <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>
        Cancel
      </Button>
      <Button
        type="submit"
        onClick={handleSubmit}
        isLoading={isLoading}
        style={{ flex: 1 }}
        disabled={!userId || roleIds.length === 0}
      >
        Save
      </Button>
    </>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={initialData ? 'Edit User' : 'Add User'}
      position="right"
      maxWidth="440px"
      actions={actions}
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        <Select
          label="Employee"
          placeholder="Select Employee"
          required
          options={employeeOptions}
          value={userId}
          onChange={(val) => setUserId(val as string)}
          disabled={!!initialData}
        />
        <MultiSelect
          label="Assign Roles"
          placeholder="Select Roles"
          required
          options={roleOptions}
          value={roleIds}
          onChange={setRoleIds}
        />
      </form>
    </Dialog>
  );
};
