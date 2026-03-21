import { TableActions } from '../../../components/common';
import styles from '../../../pages/client/ClientDetailPage.module.scss';

import type { ColumnDef } from '@tanstack/react-table';
import type { Project } from '../types/projectType';

interface ProjectColumnProps {
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export const projectColumns = ({
  onView,
  onEdit,
  onDelete,
}: ProjectColumnProps): ColumnDef<Project>[] => [
  {
    accessorKey: 'name',
    header: 'Project Name',
    size: 250,
    cell: (info) => (
      <span style={{ fontWeight: '600', color: 'var(--color-text-primary-500)' }}>
        {info.getValue() as string}
      </span>
    ),
  },
  {
    accessorKey: 'type',
    header: 'Project Type',
    size: 150,
    cell: (info) => (
      <span style={{ color: 'var(--color-secondary)' }}>{info.getValue() as string}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    size: 150,
    cell: (info) => {
      const status = info.getValue() as string;
      const statusClass =
        status === 'ACTIVE'
          ? styles.completed
          : status === 'DRAFT'
            ? styles.inProgress
            : status === 'ON_HOLD'
              ? styles.onHold
              : status === 'COMPLETED'
                ? styles.completed
                : '';
      return (
        <span className={`${styles.statusTag} ${statusClass}`}>
          {status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
        </span>
      );
    },
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    size: 120,
    cell: (info) => {
      const priority = info.getValue() as string;
      const priorityClass =
        priority === 'High'
          ? styles.high
          : priority === 'Medium'
            ? styles.medium
            : priority === 'Low'
              ? styles.low
              : '';
      return <span className={`${styles.priorityTag} ${priorityClass}`}>{priority}</span>;
    },
  },
  {
    accessorKey: 'start_date',
    header: 'Start date',
    size: 150,
    cell: (info) => (
      <span style={{ color: 'var(--color-secondary)' }}>{info.getValue() as string}</span>
    ),
  },
  {
    accessorKey: 'last_updated',
    header: 'Last Updated',
    size: 150,
    cell: (info) => (
      <span style={{ color: 'var(--color-secondary)' }}>{info.getValue() as string}</span>
    ),
  },
  {
    id: 'actions',
    header: 'Actions',
    size: 140,
    cell: (info) => (
      <TableActions
        onView={() => onView(info.row.original)}
        onEdit={() => onEdit(info.row.original)}
        onDelete={() => onDelete(info.row.original)}
      />
    ),
  },
];
