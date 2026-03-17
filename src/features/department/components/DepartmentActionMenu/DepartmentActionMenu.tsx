import React, { useState } from 'react';
import { Edit2, Trash2, MoreVertical, Power } from 'lucide-react';

import { Popover } from '../../../../components/common/Popover/Popover';
import { useDeleteDepartment } from '../../hooks/useDeleteDepartment';
import { useUpdateDepartment } from '../../hooks/useUpdateDepartment';
import { Status } from '../../../../types/common';

import styles from './DepartmentActionMenu.module.scss';

import type { Department } from '../../types/departmentType';

interface DepartmentActionMenuProps {
  department: Department;
  onEdit?: () => void;
}

export const DepartmentActionMenu: React.FC<DepartmentActionMenuProps> = ({
  department,
  onEdit,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: deleteDept } = useDeleteDepartment();
  const { mutate: updateDept } = useUpdateDepartment();

  const isInactive = department.status === Status.INACTIVE;

  const handleToggleStatus = () => {
    const newStatus = isInactive ? Status.ACTIVE : Status.INACTIVE;
    const action = isInactive ? 'activate' : 'deactivate';

    if (window.confirm(`Are you sure you want to ${action} this department?`)) {
      updateDept({ id: department.id, params: { status: newStatus } });
      setIsOpen(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      deleteDept(department.id);
      setIsOpen(false);
    }
  };

  const menuItems = [
    {
      icon: <Edit2 size={16} />,
      title: 'Edit',
      action: () => {
        onEdit?.();
        setIsOpen(false);
      },
    },
    {
      icon: <Power size={16} />,
      title: isInactive ? 'Activate' : 'Deactivate',
      action: handleToggleStatus,
    },
    {
      icon: <Trash2 size={16} />,
      title: 'Delete',
      action: handleDelete,
      className: styles.deactivate,
    },
  ];

  return (
    <Popover
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      trigger={
        <button className={styles.trigger} onClick={() => setIsOpen(!isOpen)}>
          <MoreVertical size={20} />
        </button>
      }
      items={menuItems}
      dropdownClassName={styles.dropdown}
    />
  );
};
