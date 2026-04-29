import React, { useEffect, useState } from 'react';

import { Button, Dialog } from '../../../../components/common';
import { Input } from '../../../../components/ui/Input/Input';
import { TextArea } from '../../../../components/ui/TextArea/TextArea';

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
  const [formData, setFormData] = useState<CreateRoleInput>({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: initialData.name,
        description: initialData.description,
      });
    } else {
      setFormData({
        name: '',
        description: '',
      });
    }
  }, [initialData, open]);

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
