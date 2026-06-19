import React from 'react';

import { FeedbackStatus } from '../../enums/feedback.enum';

import styles from './TicketStatusBadge.module.scss';

const STATUS_LABEL: Record<FeedbackStatus, string> = {
  [FeedbackStatus.SUBMITTED]: 'Submitted',
  [FeedbackStatus.UNDER_REVIEW]: 'Under Review',
  [FeedbackStatus.PLANNED]: 'Planned',
  [FeedbackStatus.DECLINED]: 'Declined',
  [FeedbackStatus.RELEASED]: 'Released',
  [FeedbackStatus.ACKNOWLEDGED]: 'Acknowledged',
  [FeedbackStatus.IN_PROGRESS]: 'In Progress',
  [FeedbackStatus.RESOLVED]: 'Resolved',
  [FeedbackStatus.CLOSED]: 'Closed',
};

const STATUS_CLASS: Record<FeedbackStatus, string> = {
  [FeedbackStatus.SUBMITTED]: styles.submitted,
  [FeedbackStatus.UNDER_REVIEW]: styles.underReview,
  [FeedbackStatus.PLANNED]: styles.planned,
  [FeedbackStatus.DECLINED]: styles.declined,
  [FeedbackStatus.RELEASED]: styles.released,
  [FeedbackStatus.ACKNOWLEDGED]: styles.acknowledged,
  [FeedbackStatus.IN_PROGRESS]: styles.inProgress,
  [FeedbackStatus.RESOLVED]: styles.resolved,
  [FeedbackStatus.CLOSED]: styles.closed,
};

interface TicketStatusBadgeProps {
  status: FeedbackStatus;
  className?: string;
}

export const TicketStatusBadge: React.FC<TicketStatusBadgeProps> = ({ status, className = '' }) => (
  <span className={`${styles.badge} ${STATUS_CLASS[status]} ${className}`}>
    <span className={styles.dot} />
    {STATUS_LABEL[status]}
  </span>
);
