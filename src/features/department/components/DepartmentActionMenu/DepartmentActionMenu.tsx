import React, { useState } from 'react';
import { Edit2, Trash2, MoreVertical } from 'lucide-react';

import { Popover } from '../../../../components/common/Popover/Popover';
import { useDeleteDepartment } from '../../hooks/useDeleteDepartment';

import styles from './DepartmentActionMenu.module.scss';

interface DepartmentActionMenuProps {
  departmentId: string;
  onEdit?: () => void;
}

export const DepartmentActionMenu: React.FC<DepartmentActionMenuProps> = ({
  departmentId,
  onEdit,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: deleteDept } = useDeleteDepartment();

  const handleDeactivate = () => {
    if (window.confirm('Are you sure you want to deactivate this department?')) {
      // TODO: Implement deactivation logic
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      deleteDept(departmentId);
    }
  };

  const menuItems = [
    {
      icon: <Edit2 size={16} />,
      title: 'Edit',
      action: () => onEdit?.(),
    },
    {
      icon: <Trash2 size={16} />,
      title: 'Deactivate',
      action: handleDeactivate,
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
        <button className={styles.trigger}>
          <MoreVertical size={20} />
        </button>
      }
      items={menuItems}
      dropdownClassName={styles.dropdown}
    />
  );
};
