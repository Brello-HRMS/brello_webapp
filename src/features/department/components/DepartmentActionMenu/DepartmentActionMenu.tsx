import React, { useState } from 'react';
import { Edit2, Trash2, MoreVertical, Power, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Popover } from '../../../../components/common/Popover/Popover';
import { Status } from '../../../../types/common';

import styles from './DepartmentActionMenu.module.scss';

import type { Department } from '../../types/departmentType';

interface DepartmentActionMenuProps {
  department: Department;
  onEdit?: () => void;
  onToggleStatus?: () => void;
  onDelete?: () => void;
}

export const DepartmentActionMenu: React.FC<DepartmentActionMenuProps> = ({
  department,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const isInactive = department.status === Status.INACTIVE;

  const menuItems = [
    {
      icon: <Edit2 size={16} />,
      title: 'Edit',
      action: () => {
        onEdit?.();
        setIsOpen(false);
      },
      disabled: isInactive,
    },
    {
      icon: <Power size={16} />,
      title: isInactive ? 'Activate' : 'Deactivate',
      action: () => {
        onToggleStatus?.();
        setIsOpen(false);
      },
    },
    {
      icon: <Trash2 size={16} />,
      title: 'Delete',
      action: () => {
        onDelete?.();
        setIsOpen(false);
      },
      className: styles.deactivate,
    },
  ];

  return (
    <Popover
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      trigger={
        <button
          className={styles.trigger}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          <MoreVertical size={20} />
        </button>
      }
      items={menuItems}
      dropdownClassName={styles.dropdown}
    />
  );
};
