import { formatDateTime } from '../../../utils/timeUtils';
import { AuditModuleBadge } from '../components/AuditModuleBadge';
import { AuditActionBadge } from '../components/AuditActionBadge';

import styles from './auditColumns.module.css';

import type { AuditLog } from '../types/audit.types';
import type { ColumnDef } from '@tanstack/react-table';

interface AuditColumnsProps {
  onView: (log: AuditLog) => void;
}

export const auditColumns = ({ onView }: AuditColumnsProps): ColumnDef<AuditLog>[] => [
  {
    id: 'module',
    header: 'Module',
    size: 140,
    cell: (info) => <AuditModuleBadge module={info.row.original.module} />,
  },
  {
    id: 'action',
    header: 'Action',
    size: 120,
    cell: (info) => <AuditActionBadge action={info.row.original.action} />,
  },
  {
    id: 'entity',
    header: 'Entity',
    size: 180,
    cell: (info) => {
      const log = info.row.original;
      return (
        <div className={styles.entityCell}>
          <span className={styles.entityType}>{log.entity_type}</span>
          {log.entity_display_name && (
            <span className={styles.entityName}>{log.entity_display_name}</span>
          )}
        </div>
      );
    },
  },
  {
    id: 'actor',
    header: 'Actor',
    size: 180,
    cell: (info) => {
      const log = info.row.original;
      return (
        <div className={styles.actorCell}>
          <span className={styles.actorName}>{log.actor_name}</span>
          <span className={styles.actorEmail}>{log.actor_email}</span>
        </div>
      );
    },
  },
  {
    id: 'created_at',
    header: 'Time',
    size: 160,
    cell: (info) => (
      <span className={styles.time}>{formatDateTime(info.row.original.created_at)}</span>
    ),
  },
  {
    id: 'actions',
    header: '',
    size: 60,
    cell: (info) => (
      <button className={styles.viewBtn} onClick={() => onView(info.row.original)}>
        View
      </button>
    ),
  },
];
