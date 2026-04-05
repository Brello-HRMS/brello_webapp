import React, { useState } from 'react';
import { Eye, Edit2, Trash2, MoreVertical } from 'lucide-react';

import { Popover } from '../../../../components/common/Popover/Popover';
import { Status } from '../../../../types/common';

import styles from './EmployeeActionMenu.module.scss';

import type { Employee } from '../../types/employeeType';

interface EmployeeActionMenuProps {
  employee: Employee;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const EmployeeActionMenu: React.FC<EmployeeActionMenuProps> = ({
  employee,
  onView,
  onEdit,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const isInactive = employee.status === Status.INACTIVE;

  const menuItems = [
    {
      icon: <Eye size={16} />,
      title: 'View',
      action: () => {
        onView?.();
        setIsOpen(false);
      },
    },
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
      icon: <Trash2 size={16} />,
      title: 'Delete',
      action: () => {
        onDelete?.();
        setIsOpen(false);
      },
      className: styles.delete,
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
