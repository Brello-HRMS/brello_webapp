import React from 'react';

import { Status } from '../../../types/common';

import styles from './StatusBadge.module.scss';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusClass = () => {
    switch (status) {
      case Status.ACTIVE:
        return styles.active;
      case Status.INACTIVE:
        return styles.inactive;
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
