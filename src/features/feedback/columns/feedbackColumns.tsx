import { TicketStatusBadge } from '../components/TicketStatusBadge/TicketStatusBadge';
import { FeedbackType, FeedbackCategory } from '../enums/feedback.enum';

import styles from './feedbackColumns.module.scss';

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

interface FeedbackColumnsProps {
  onView: (ticket: FeedbackTicket) => void;
}

export const feedbackColumns = ({ onView }: FeedbackColumnsProps): ColumnDef<FeedbackTicket>[] => [
  {
    id: 'title',
    header: 'Title',
    size: 260,
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
    size: 100,
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
    id: 'created_at',
    header: 'Submitted',
    size: 140,
    cell: (info) =>
      new Date(info.row.original.created_at).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
  },
];
