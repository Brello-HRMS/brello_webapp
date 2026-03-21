import React, { useState, useEffect } from 'react';
import { Code, Tv, Users, Gamepad2, Headphones, Layers, FileText, Banknote } from 'lucide-react';

import { Dialog, Button } from '../../../../components/common';
import { Input } from '../../../../components/ui/Input/Input';
import { useCreateDesignation } from '../../hooks/useCreateDesignation';
import { useUpdateDesignation } from '../../hooks/useUpdateDesignation';
import { Status } from '../../../../types/common';
import { Select } from '../../../../components/ui/Select/Select';
import { useDepartments } from '../../../department/hooks/useDepartments';

import styles from './AddDesignationModal.module.scss';

import type { Designation, CreateDesignationParams } from '../../types/designationType';
import type { Department } from '../../../department/types/departmentType';

interface AddDesignationModalProps {
  open: boolean;
  onClose: () => void;
  designation?: Designation | null;
}

const departmentIcons: Record<string, React.ReactNode> = {
  code: <Code size={20} />,
  tv: <Tv size={20} />,
  users: <Users size={20} />,
  gamepad: <Gamepad2 size={20} />,
  headphones: <Headphones size={20} />,
  layers: <Layers size={20} />,
  file: <FileText size={20} />,
  banknote: <Banknote size={20} />,
};

const initialFormState = {
  code: '',
  title: '',
  description: '',
  department_id: '',
  isActive: true,
};

export const AddDesignationModal: React.FC<AddDesignationModalProps> = ({
  open,
  onClose,
  designation,
}) => {
  const [formData, setFormData] = useState(initialFormState);

  const { mutate: createDesig, isPending: isCreating } = useCreateDesignation();
  const { mutate: updateDesig, isPending: isUpdating } = useUpdateDesignation();

  const isPending = isCreating || isUpdating;
  const isEdit = !!designation;

  useEffect(() => {
    if (open) {
      const handleOpen = () => {
        if (designation) {
          setFormData({
            code: designation.code,
            title: designation.title,
            description: designation.description || '',
            department_id: designation.department_id || '',
            isActive: designation.status === Status.ACTIVE,
          });
        } else {
          setFormData(initialFormState);
        }
      };
      handleOpen();
    }
  }, [open, designation]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, isActive: e.target.checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: CreateDesignationParams = {
      code: formData.code,
      title: formData.title,
      status: formData.isActive ? Status.ACTIVE : Status.INACTIVE,
      department_id: formData.department_id,
    };

    if (isEdit && designation) {
      updateDesig(
        { id: designation.id, params: payload },
        {
          onSuccess: () => {
            onClose();
          },
        },
      );
    } else {
      createDesig(payload, {
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
        {isEdit ? 'Save changes' : 'Create designation'}
      </Button>
    </div>
  );

  const { data: response } = useDepartments();
  const departmentOptions =
    response?.data.data.map((department: Department) => ({
      label: department.name,
      value: department.id,
    })) || [];

  const selectedDepartment = response?.data.data.find(
    (dept: Department) => dept.id === formData.department_id,
  );

  return (
    <Dialog
      title={isEdit ? 'Edit Designation' : 'Add New Designation'}
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
            label="Designation Name*"
            required
            placeholder="e.g., Senior Developer"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Input
            label="Designation Code*"
            required
            placeholder="e.g., SD"
            name="code"
            value={formData.code}
            onChange={handleInputChange}
          />
        </div>

        <div>
          <Select
            label="Department*"
            required
            placeholder="Select department"
            name="department_id"
            value={formData.department_id}
            onChange={handleInputChange}
            options={departmentOptions}
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

        <div className={styles.departmentIconCard}>
          <div className={styles.departmentIconBox}>
            {selectedDepartment?.icon ? (
              departmentIcons[selectedDepartment.icon] || <Code size={20} />
            ) : (
              <Code size={20} />
            )}
          </div>
          <div className={styles.departmentIconInfo}>
            <span className={styles.departmentIconTitle}>Department Icon</span>
            <span className={styles.departmentIconDesc}>
              This designation will automatically use the selected department's icon.
            </span>
          </div>
        </div>
      </form>
    </Dialog>
  );
};
