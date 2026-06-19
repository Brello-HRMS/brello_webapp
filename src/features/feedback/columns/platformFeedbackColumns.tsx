import { TicketStatusBadge } from '../components/TicketStatusBadge/TicketStatusBadge';
import { FeedbackType, FeedbackCategory } from '../enums/feedback.enum';

import styles from './platformFeedbackColumns.module.scss';

import type { FeedbackTicket } from '../types/feedbackTypes';
import type { ColumnDef } from '@tanstack/react-table';

const CATEGORY_LABEL: Record<FeedbackCategory, string> = {
  [FeedbackCategory.FEATURE_REQUEST]: 'Feature Request',
  [FeedbackCategory.SUGGESTION]: 'Suggestion',
  [FeedbackCategory.PRAISE]: 'Praise',
  [FeedbackCategory.BUG]: 'Bug',
  [FeedbackCategory.UI_UX]: 'UI / UX Issue',
  [FeedbackCategory.PERFORMANCE]: 'Performance',
  [FeedbackCategory.DATA_ISSUE]: 'Data Issue',
};

interface PlatformFeedbackColumnsProps {
  onView: (ticket: FeedbackTicket) => void;
}

export const platformFeedbackColumns = ({
  onView,
}: PlatformFeedbackColumnsProps): ColumnDef<FeedbackTicket>[] => [
  {
    id: 'title',
    header: 'Title',
    size: 240,
    cell: (info) => {
      const t = info.row.original;
      return (
        <div className={styles.titleCell}>
          <span className={styles.clickable} onClick={() => onView(t)}>
            {t.title}
          </span>
          <span className={styles.categoryChip}>{CATEGORY_LABEL[t.category]}</span>
        </div>
      );
    },
  },
  {
    id: 'type',
    header: 'Type',
    size: 130,
    cell: (info) => {
      const type = info.row.original.type;
      return (
        <span
          className={`${styles.typeChip} ${type === FeedbackType.FEEDBACK ? styles.typeFeedback : styles.typeIssue}`}
        >
          {type === FeedbackType.FEEDBACK ? 'Feedback' : 'Issue Report'}
        </span>
      );
    },
  },
  {
    id: 'status',
    header: 'Status',
    size: 140,
    cell: (info) => <TicketStatusBadge status={info.row.original.ticket_status} />,
  },
  {
    id: 'priority',
    header: 'Priority',
    size: 110,
    cell: (info) => {
      const p = info.row.original.priority;
      return (
        <span className={`${styles.priorityBadge} ${styles[p.toLowerCase()]}`}>
          {p.charAt(0) + p.slice(1).toLowerCase()}
        </span>
      );
    },
  },
  {
    id: 'organization',
    header: 'Organisation',
    size: 150,
    cell: (info) => {
      const t = info.row.original;
      return (
        <span className={styles.orgCell}>
          {t.organization_name ?? t.organization_id.slice(0, 8) + '…'}
        </span>
      );
    },
  },
  {
    id: 'created_at',
    header: 'Submitted',
    size: 130,
    cell: (info) =>
      new Date(info.row.original.created_at).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
  },
];
