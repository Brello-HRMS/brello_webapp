import React, { useState, useEffect } from 'react';
import { Code, Tv, Users, Gamepad2, Headphones, Layers, FileText, Banknote } from 'lucide-react';

import { Dialog, Button } from '../../../../components/common';
import { Input } from '../../../../components/ui/Input/Input';
import { useCreateDepartment } from '../../hooks/useCreateDepartment';
import { useUpdateDepartment } from '../../hooks/useUpdateDepartment';
import { Status } from '../../../../types/common';

import styles from './AddDepartmentModal.module.scss';

interface AddDepartmentModalProps {
  open: boolean;
  onClose: () => void;
  department?: Department | null;
}

const icons = [
  { id: 'code', component: <Code size={20} /> },
  { id: 'tv', component: <Tv size={20} /> },
  { id: 'users', component: <Users size={20} /> },
  { id: 'gamepad', component: <Gamepad2 size={20} /> },
  { id: 'headphones', component: <Headphones size={20} /> },
  { id: 'layers', component: <Layers size={20} /> },
  { id: 'file', component: <FileText size={20} /> },
  { id: 'banknote', component: <Banknote size={20} /> },
];

import type { Department } from '../../types/departmentType';

const initialFormState = {
  name: '',
  code: '',
  description: '',
  isActive: true,
};

export const AddDepartmentModal: React.FC<AddDepartmentModalProps> = ({
  open,
  onClose,
  department,
}) => {
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [formData, setFormData] = useState(initialFormState);

  const { mutate: createDept, isPending: isCreating } = useCreateDepartment();
  const { mutate: updateDept, isPending: isUpdating } = useUpdateDepartment();

  const isPending = isCreating || isUpdating;
  const isEdit = !!department;

  useEffect(() => {
    if (open) {
      const handleOpen = () => {
        if (department) {
          setFormData({
            name: department.name,
            code: department.code,
            description: department.description || '',
            isActive: department.status === Status.ACTIVE,
          });
        } else {
          setFormData(initialFormState);
        }

        setSelectedIcon(null);
      };
      handleOpen();
    }
  }, [open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, isActive: e.target.checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      code: formData.code.toUpperCase(),
      description: formData.description,
      status: formData.isActive ? Status.ACTIVE : Status.INACTIVE,
    };

    if (isEdit && department) {
      updateDept(
        { id: department.id, params: payload },
        {
          onSuccess: () => {
            onClose();
          },
        },
      );
    } else {
      createDept(payload, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  const actions = (
    <div className={styles.actions}>
      <Button
        variant="secondary"
        onClick={onClose}
        type="button"
        className={styles.cancelAction}
        disabled={isPending}
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        type="submit"
        className={styles.saveAction}
        isLoading={isPending}
      >
        {isEdit ? 'Save changes' : 'Create department'}
      </Button>
    </div>
  );

  return (
    <Dialog
      title={isEdit ? 'Edit Department' : 'Add New Department'}
      open={open}
      onClose={onClose}
      actions={actions}
      maxWidth="500px"
      position="right"
    >
      <form
        className={styles.formContainer}
        onSubmit={(e) => {
          e.preventDefault();
          onClose();
        }}
      >
        <div className={styles.formGroup}>
          <Input
            label="Department Name*"
            required
            placeholder="e.g., Finance"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
          />
        </div>

        <div className={styles.formGroup}>
          <Input
            type="text"
            label="Department Code*"
            required
            placeholder="e.g., FIN-001"
            name="code"
            value={formData.code.toUpperCase()}
            onChange={handleInputChange}
          />
        </div>

        <div className={styles.formGroup}>
          <Input
            label="Description"
            placeholder="Enter department description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
          />
        </div>

        <div className={styles.statusRow}>
          <div>
            <label className={styles.statusLabel}>Status</label>
            <span className={styles.statusSubLabel}>Set the initial visibility state</span>
          </div>
          <div className={styles.toggleContainer}>
            <span className={styles.activeText}>Active</span>
            <label className={styles.switch}>
              <input type="checkbox" checked={formData.isActive} onChange={handleToggleChange} />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.iconLabel}>
            Department Icon<span className={styles.required}>*</span>
          </label>
          <div className={styles.iconGrid}>
            {icons.map((icon) => (
              <button
                key={icon.id}
                type="button"
                className={`${styles.iconButton} ${selectedIcon === icon.id ? styles.selected : ''}`}
                onClick={() => setSelectedIcon(icon.id)}
              >
                {icon.component}
              </button>
            ))}
          </div>
        </div>
      </form>
    </Dialog>
  );
};
