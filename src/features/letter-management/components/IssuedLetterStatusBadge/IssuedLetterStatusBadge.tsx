import React from 'react';

import styles from './IssuedLetterStatusBadge.module.scss';

import type { IssuedLetterDeliveryStatus } from '../../types/letterTypes';

const STATUS_LABEL: Record<IssuedLetterDeliveryStatus, string> = {
  ISSUED: 'Issued',
  VIEWED: 'Viewed',
  ACKNOWLEDGED: 'Acknowledged',
};

const STATUS_CLASS: Record<IssuedLetterDeliveryStatus, string> = {
  ISSUED: styles.issued,
  VIEWED: styles.viewed,
  ACKNOWLEDGED: styles.acknowledged,
};

interface IssuedLetterStatusBadgeProps {
  status: IssuedLetterDeliveryStatus;
  className?: string;
}

export const IssuedLetterStatusBadge: React.FC<IssuedLetterStatusBadgeProps> = ({
  status,
  className = '',
}) => (
  <span className={`${styles.badge} ${STATUS_CLASS[status]} ${className}`}>
    <span className={styles.dot} />
    {STATUS_LABEL[status]}
  </span>
);
