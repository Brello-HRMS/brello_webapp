import React, { useState } from 'react';
import { Edit2, Trash2, MoreVertical, Power } from 'lucide-react';

import { Popover } from '../../../../components/common/Popover/Popover';
import { Status } from '../../../../types/common';

import styles from './DesignationActionMenu.module.scss';

import type { Designation } from '../../types/designationType';

interface DesignationActionMenuProps {
  designation: Designation;
  onEdit?: () => void;
  onToggleStatus?: () => void;
  onDelete?: () => void;
}

export const DesignationActionMenu: React.FC<DesignationActionMenuProps> = ({
  designation,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const isInactive = designation.status === Status.INACTIVE;

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
