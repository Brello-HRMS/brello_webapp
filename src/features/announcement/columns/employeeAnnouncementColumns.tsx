import { Eye } from 'lucide-react';

import { AnnouncementPriority } from '../types/announcementTypes';

import styles from './employeeAnnouncementColumns.module.scss';

import type { EmployeeAnnouncement } from '../types/announcementTypes';
import type { ColumnDef } from '@tanstack/react-table';

interface EmployeeAnnouncementColumnsProps {
  onView: (announcement: EmployeeAnnouncement) => void;
}

const PRIORITY_LABEL: Record<AnnouncementPriority, string> = {
  [AnnouncementPriority.NORMAL]: 'Normal',
  [AnnouncementPriority.IMPORTANT]: 'Important',
  [AnnouncementPriority.URGENT]: 'Urgent',
};

const PRIORITY_CLASS: Record<AnnouncementPriority, string> = {
  [AnnouncementPriority.NORMAL]: styles.priorityNormal,
  [AnnouncementPriority.IMPORTANT]: styles.priorityImportant,
  [AnnouncementPriority.URGENT]: styles.priorityUrgent,
};

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const employeeAnnouncementColumns = ({
  onView,
}: EmployeeAnnouncementColumnsProps): ColumnDef<EmployeeAnnouncement>[] => [
  {
    id: 'title',
    header: 'Title',
    size: 320,
    cell: (info) => {
      const { title, is_read } = info.row.original;
      return (
        <div className={styles.titleCell}>
          <div className={styles.titleRow}>
            {!is_read && <span className={styles.unreadDot} />}
            <span className={styles.titleText}>{title}</span>
          </div>
        </div>
      );
    },
  },
  {
    id: 'priority',
    header: 'Priority',
    size: 110,
    cell: (info) => {
      const priority = info.row.original.priority;
      return (
        <span className={`${styles.priorityBadge} ${PRIORITY_CLASS[priority]}`}>
          {PRIORITY_LABEL[priority]}
        </span>
      );
    },
  },
  {
    id: 'published_at',
    header: 'Date',
    size: 130,
    cell: (info) => (
      <span className={styles.dateCell}>{formatDate(info.row.original.published_at)}</span>
    ),
  },
  {
    id: 'is_read',
    header: 'Status',
    size: 90,
    cell: (info) => {
      const { is_read } = info.row.original;
      return (
        <span className={`${styles.readStatus} ${is_read ? styles.read : styles.unread}`}>
          {is_read ? 'Read' : 'Unread'}
        </span>
      );
    },
  },
  {
    id: 'action',
    header: '',
    size: 60,
    cell: (info) => (
      <button
        className={styles.viewBtn}
        onClick={() => onView(info.row.original)}
        title="View announcement"
      >
        <Eye size={14} />
      </button>
    ),
  },
];
