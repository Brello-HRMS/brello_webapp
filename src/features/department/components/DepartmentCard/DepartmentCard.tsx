import React from 'react';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { AvatarGroup } from '../../../../components/common/AvatarGroup/AvatarGroup';
import { StatusBadge } from '../../../../components/common/StatusBadge/StatusBadge';
import { Status } from '../../../../types/common';
import { DepartmentActionMenu } from '../DepartmentActionMenu/DepartmentActionMenu';

import styles from './DepartmentCard.module.scss';

import type { Department } from '../../types/departmentType';

export interface DepartmentCardProps {
  department: Department;
  iconBg?: string;
  iconColor?: string;
  onEditClick?: () => void;
  onToggleStatus?: () => void;
  onDelete?: () => void;
}

export const DepartmentCard: React.FC<DepartmentCardProps> = ({
  department,
  iconBg = 'var(--color-gray-50)',
  iconColor = 'var(--color-primary-purple)',
  onEditClick,
  onToggleStatus,
  onDelete,
}) => {
  const { name, code, status, icon } = department;
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (status === Status.INACTIVE) return;
    navigate(`/organisation/departments/${department.id}`);
  };

  const isInactive = status === Status.INACTIVE;

  return (
    <div
      className={styles.card}
      onClick={handleCardClick}
      style={{ cursor: isInactive ? 'default' : 'pointer' }}
    >
      <div className={styles.header}>
        <div className={styles.iconWrapper} style={{ backgroundColor: iconBg, color: iconColor }}>
          {icon ? (
            <img src={icon} alt={name} width={24} height={24} className={styles.icon} />
          ) : (
            <Users size={24} />
          )}
        </div>

        <DepartmentActionMenu
          department={department}
          onEdit={onEditClick}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.code}>Code: {code}</p>
      </div>

      <div className={styles.footer}>
        <AvatarGroup
          avatars={[
            'https://i.pravatar.cc/150?u=1',
            'https://i.pravatar.cc/150?u=2',
            'https://i.pravatar.cc/150?u=3',
          ]}
          max={3}
          size={24}
        />

        <StatusBadge status={status} />
      </div>
    </div>
  );
};
