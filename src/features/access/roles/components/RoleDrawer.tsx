import React, { useState, useMemo } from 'react';

import { Button, Dialog, Select } from '../../../../components/common';
import { Input } from '../../../../components/ui/Input/Input';
import { TextArea } from '../../../../components/ui/TextArea/TextArea';
import { getAvailableApps } from '../../../../utils/authUtils';

import type { Role, CreateRoleInput } from '../types';

interface RoleDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateRoleInput) => Promise<void>;
  initialData?: Role | null;
  isLoading?: boolean;
}

export const RoleDrawer: React.FC<RoleDrawerProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}) => {
  const availableApps = getAvailableApps();
  const appOptions = useMemo(
    () =>
      availableApps.map((app) => ({
        value: app.id,
        label: app.name,
      })),
    [availableApps],
  );

  const [formData, setFormData] = useState<CreateRoleInput>({
    name: '',
    description: '',
    app_id: '',
  });

  const [prevInitialData, setPrevInitialData] = useState<Role | null | undefined>(undefined);

  if (initialData !== prevInitialData) {
    setFormData({
      name: initialData?.name || '',
      description: initialData?.description || '',
      app_id: initialData?.app_id || appOptions[0]?.value || '',
    });
    setPrevInitialData(initialData);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onClose();
  };

  const actions = (
    <>
      <Button variant="secondary" onClick={onClose} style={{ flex: 1 }}>
        Cancel
      </Button>
      <Button type="submit" onClick={handleSubmit} isLoading={isLoading} style={{ flex: 1 }}>
        Save
      </Button>
    </>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={initialData ? 'Edit Role' : 'Create Role'}
      position="right"
      maxWidth="440px"
      actions={actions}
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        <Select
          label="Select App"
          value={formData.app_id}
          onChange={(value) => setFormData({ ...formData, app_id: value as string })}
          options={appOptions}
          required
        />
        <Input
          label="Role Name"
          placeholder="e.g., Finance Manager"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <TextArea
          label="Description"
          placeholder="Describe this role's purpose..."
          required
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </form>
    </Dialog>
  );
};
