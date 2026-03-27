import React from 'react';
import { Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { StatusBadge } from '../../../../components/common/StatusBadge/StatusBadge';
import { Status } from '../../../../types/common';
import { DesignationActionMenu } from '../DesignationActionMenu/DesignationActionMenu';

import styles from './DesignationCard.module.scss';

import type { Designation } from '../../types/designationType';

export interface DesignationCardProps {
  designation: Designation;
  iconBg?: string;
  iconColor?: string;
  onEditClick?: () => void;
  onToggleStatus?: () => void;
  onDelete?: () => void;
  isSelecting?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const DesignationCard: React.FC<DesignationCardProps> = ({
  designation,
  iconBg = 'var(--color-gray-50)',
  iconColor = 'var(--color-primary-purple)',
  onEditClick,
  onToggleStatus,
  onDelete,
  isSelecting = false,
  isSelected = false,
  onSelect,
}) => {
  const { title, code, status } = designation;
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSelecting) {
      onSelect?.();
      return;
    }
    if (status === Status.INACTIVE) return;
    navigate(`/organisation/designations/${designation.id}`);
  };

  const isInactive = status === Status.INACTIVE;

  return (
    <div
      className={`${styles.card} ${isSelecting ? styles.selecting : ''} ${
        isSelected ? styles.selected : ''
      }`}
      onClick={handleCardClick}
      style={{ cursor: isInactive && !isSelecting ? 'default' : 'pointer' }}
    >
      <div className={styles.header}>
        <div className={styles.iconWrapper} style={{ backgroundColor: iconBg, color: iconColor }}>
          <Briefcase size={24} />
        </div>
        {!isSelecting && (
          <DesignationActionMenu
            designation={designation}
            onEdit={onEditClick}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
          />
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>{title}</h3>
        <p className={styles.code}>Code: {code}</p>
      </div>

      <div className={styles.footer}>
        <div />

        <StatusBadge status={status} />
      </div>
    </div>
  );
};
