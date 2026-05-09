import React from 'react';

import { Status } from '../../../types/common';

import styles from './StatusBadge.module.scss';

interface StatusBadgeProps {
  status: Status | string | null;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  if (!status) return null;

  const getStatusClass = () => {
    switch (status) {
      case Status.ACTIVE:
      case 'ACTIVE':
        return styles.active;
      case Status.INACTIVE:
      case 'INACTIVE':
      case 'OFFBOARDED':
        return styles.inactive;
      case Status.PENDING:
      case 'PENDING':
      case 'ONBOARDING':
      case 'DRAFT':
        return styles.pending;
      case 'INVITED':
        return styles.invited;
      default:
        return '';
    }
  };

  return (
    <span className={`${styles.badge} ${getStatusClass()} ${className}`}>
      <span className={styles.dot}></span>
      {status.toLowerCase()}
    </span>
  );
};
