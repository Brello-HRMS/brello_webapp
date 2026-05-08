import { Pencil, Archive, Trash2, SendHorizonal } from 'lucide-react';

import { AnnouncementPriority, AnnouncementStatus } from '../types/announcementTypes';

import styles from './adminAnnouncementColumns.module.scss';

import type { Announcement } from '../types/announcementTypes';
import type { ColumnDef } from '@tanstack/react-table';

interface AdminAnnouncementColumnsProps {
  onEdit: (announcement: Announcement) => void;
  onPublishNow: (announcement: Announcement) => void;
  onArchive: (announcement: Announcement) => void;
  onDelete: (announcement: Announcement) => void;
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

const STATUS_LABEL: Record<AnnouncementStatus, string> = {
  [AnnouncementStatus.DRAFT]: '○ Draft',
  [AnnouncementStatus.SCHEDULED]: '◷ Scheduled',
  [AnnouncementStatus.PUBLISHED]: '● Published',
  [AnnouncementStatus.ARCHIVED]: '✕ Archived',
};

const STATUS_CLASS: Record<AnnouncementStatus, string> = {
  [AnnouncementStatus.DRAFT]: styles.statusDraft,
  [AnnouncementStatus.SCHEDULED]: styles.statusScheduled,
  [AnnouncementStatus.PUBLISHED]: styles.statusPublished,
  [AnnouncementStatus.ARCHIVED]: styles.statusArchived,
};

const formatDate = (dateStr: string | null | undefined) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const adminAnnouncementColumns = ({
  onEdit,
  onPublishNow,
  onArchive,
  onDelete,
}: AdminAnnouncementColumnsProps): ColumnDef<Announcement>[] => [
  {
    id: 'title',
    header: 'Title',
    size: 280,
    cell: (info) => (
      <div className={styles.titleCell}>
        <span className={styles.titleText}>{info.row.original.title}</span>
      </div>
    ),
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
    id: 'status',
    header: 'Status',
    size: 130,
    cell: (info) => {
      const status = info.row.original.status;
      return (
        <span className={`${styles.statusBadge} ${STATUS_CLASS[status]}`}>
          {STATUS_LABEL[status]}
        </span>
      );
    },
  },
  {
    id: 'published_at',
    header: 'Published / Scheduled',
    size: 180,
    cell: (info) => {
      const { status, published_at, scheduled_at } = info.row.original;
      const date = status === AnnouncementStatus.SCHEDULED ? scheduled_at : published_at;
      return <span className={styles.dateCell}>{formatDate(date)}</span>;
    },
  },
  {
    id: 'created_by',
    header: 'Created By',
    size: 140,
    cell: (info) => (
      <span className={styles.dateCell}>{info.row.original.created_by_name ?? '—'}</span>
    ),
  },
  {
    id: 'read_count',
    header: 'Read',
    size: 80,
    cell: (info) => <span className={styles.readCount}>{info.row.original.read_count ?? 0}</span>,
  },
  {
    id: 'actions',
    header: 'Actions',
    size: 130,
    cell: (info) => {
      const a = info.row.original;
      const editableStatuses: AnnouncementStatus[] = [
        AnnouncementStatus.DRAFT,
        AnnouncementStatus.SCHEDULED,
      ];
      const publishableStatuses: AnnouncementStatus[] = [
        AnnouncementStatus.DRAFT,
        AnnouncementStatus.SCHEDULED,
      ];

      return (
        <div className={styles.actions}>
          <button
            className={styles.actionBtn}
            onClick={() => onEdit(a)}
            disabled={!editableStatuses.includes(a.status)}
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            className={styles.actionBtn}
            onClick={() => onPublishNow(a)}
            disabled={!publishableStatuses.includes(a.status)}
            title="Publish now"
          >
            <SendHorizonal size={14} />
          </button>
          <button
            className={styles.actionBtn}
            onClick={() => onArchive(a)}
            disabled={a.status !== AnnouncementStatus.PUBLISHED}
            title="Archive"
          >
            <Archive size={14} />
          </button>
          <button
            className={`${styles.actionBtn} ${styles.danger}`}
            onClick={() => onDelete(a)}
            disabled={a.status !== AnnouncementStatus.DRAFT}
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      );
    },
  },
];
