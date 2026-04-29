import React from 'react';

import { EmployeeActionMenu } from '../EmployeeActionMenu/EmployeeActionMenu';
import { StatusBadge } from '../../../../components/common';
import { Status } from '../../../../types/common';

import styles from './EmployeeCard.module.scss';

import type { Employee } from '../../types/employeeType';

export interface EmployeeCardProps {
  employee: Employee;
  onView?: () => void;
  onEditClick?: () => void;
  onDelete?: () => void;
  isSelecting?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  onView,
  onEditClick,
  onDelete,
  isSelecting = false,
  isSelected = false,
  onSelect,
}) => {
  const { id, firstName, lastName, status, avatar, role, department, type } = employee;

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSelecting) {
      onSelect?.();
      return;
    }
    if (status === Status.INACTIVE) return;
    onView?.();
  };

  const isInactive = status === Status.INACTIVE;
  const shortId = `EMP-${id.substring(0, 3).toUpperCase()}`;

  return (
    <div
      className={`${styles.card} ${isSelecting ? styles.selecting : ''} ${
        isSelected ? styles.selected : ''
      }`}
      onClick={handleCardClick}
      style={{ cursor: isInactive && !isSelecting ? 'default' : 'pointer' }}
    >
      <div
        className={styles.actionMenuWrapper}
        style={{ position: 'absolute', top: '16px', right: '16px' }}
      >
        <EmployeeActionMenu
          employee={employee}
          onView={onView}
          onEdit={onEditClick}
          onDelete={onDelete}
        />
      </div>

      <div className={styles.avatarContainer}>
        {avatar ? (
          <img src={avatar} alt={`${firstName} ${lastName}`} className={styles.avatar} />
        ) : (
          <div className={styles.avatarFallback}>
            {firstName.charAt(0)}
            {lastName.charAt(0)}
          </div>
        )}
      </div>

      <div className={styles.content}>
        <span className={styles.employeeId}>{shortId}</span>
        <h3 className={styles.name}>{`${firstName} ${lastName}`}</h3>
      </div>

      <div className={styles.detailsBox}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Job Title</span>
          <span className={styles.detailValue}>{role || 'Not Specified'}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>Department</span>
          <span className={styles.detailValue}>{department || 'Not Specified'}</span>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.typeBadge}>{type || 'Full-time'}</div>
        <StatusBadge status={status as Status} />
      </div>
    </div>
  );
};
