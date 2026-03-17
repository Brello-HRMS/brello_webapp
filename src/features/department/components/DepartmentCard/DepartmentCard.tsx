import React from 'react';
import { Users } from 'lucide-react';

import { AvatarGroup } from '../../../../components/common/AvatarGroup/AvatarGroup';
import { StatusBadge } from '../../../../components/common/StatusBadge/StatusBadge';
import { DepartmentActionMenu } from '../DepartmentActionMenu/DepartmentActionMenu';

import styles from './DepartmentCard.module.scss';

import type { Department } from '../../types/departmentType';

export interface DepartmentCardProps {
  department: Department;
  iconBg?: string;
  iconColor?: string;
  onEditClick?: () => void;
}

export const DepartmentCard: React.FC<DepartmentCardProps> = ({
  department,
  iconBg = 'var(--color-gray-50)',
  iconColor = 'var(--color-primary-purple)',
  onEditClick,
}) => {
  const { name, code, status, icon } = department;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconWrapper} style={{ backgroundColor: iconBg, color: iconColor }}>
          {icon ? (
            <img src={icon} alt={name} width={24} height={24} className={styles.icon} />
          ) : (
            <Users size={24} />
          )}
        </div>
        <DepartmentActionMenu department={department} onEdit={onEditClick} />
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
