import React from 'react';

import styles from './OfferStatusBadge.module.scss';

import type { OfferStatus } from '../../types/offerTypes';

interface Props {
  status: OfferStatus;
  className?: string;
}

const STATUS_LABELS: Record<OfferStatus, string> = {
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved',
  SENT: 'Sent',
  VIEWED: 'Viewed',
  NEGOTIATING: 'Negotiating',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
  WITHDRAWN: 'Withdrawn',
  SYNCED: 'Synced',
};

const getStatusVariant = (status: OfferStatus): string => {
  switch (status) {
    case 'DRAFT':
      return styles.draft;
    case 'PENDING_APPROVAL':
      return styles.pending;
    case 'APPROVED':
      return styles.approved;
    case 'SENT':
      return styles.sent;
    case 'VIEWED':
      return styles.viewed;
    case 'NEGOTIATING':
      return styles.negotiating;
    case 'ACCEPTED':
      return styles.accepted;
    case 'REJECTED':
      return styles.rejected;
    case 'EXPIRED':
      return styles.expired;
    case 'WITHDRAWN':
      return styles.withdrawn;
    case 'SYNCED':
      return styles.synced;
    default:
      return '';
  }
};

export const OfferStatusBadge: React.FC<Props> = ({ status, className = '' }) => (
  <span className={`${styles.badge} ${getStatusVariant(status)} ${className}`}>
    <span className={styles.dot} />
    {STATUS_LABELS[status] ?? status}
  </span>
);
