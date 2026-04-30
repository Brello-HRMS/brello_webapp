import { Pencil, Trash2, Paperclip } from 'lucide-react';

import { formatINR } from '../../../utils/numberUtils';
import { ReimbursementStatus } from '../types/reimbursementTypes';

import styles from './employeeReimbursementColumns.module.scss';

import type { Reimbursement } from '../types/reimbursementTypes';
import type { ColumnDef } from '@tanstack/react-table';

interface EmployeeReimbursementColumnsProps {
  onEdit: (reimbursement: Reimbursement) => void;
  onDelete: (reimbursement: Reimbursement) => void;
}

const renderStatusBadge = (status: ReimbursementStatus) => {
  const cls =
    status === ReimbursementStatus.APPROVED
      ? styles.statusApproved
      : status === ReimbursementStatus.REJECTED
        ? styles.statusRejected
        : styles.statusPending;

  const label =
    status === ReimbursementStatus.APPROVED
      ? '✓ Approved'
      : status === ReimbursementStatus.REJECTED
        ? '✕ Rejected'
        : '⊙ Pending';

  return <span className={`${styles.statusBadge} ${cls}`}>{label}</span>;
};

export const employeeReimbursementColumns = ({
  onEdit,
  onDelete,
}: EmployeeReimbursementColumnsProps): ColumnDef<Reimbursement>[] => [
  {
    id: 'title',
    header: 'Title',
    size: 220,
    cell: (info) => <span className={styles.titleCell}>{info.row.original.title}</span>,
  },
  {
    id: 'amount',
    header: 'Amount',
    size: 120,
    cell: (info) => (
      <span className={styles.amountCell}>{formatINR(info.row.original.amount)}</span>
    ),
  },
  {
    id: 'expense_date',
    header: 'Date',
    size: 120,
    cell: (info) => {
      const d = new Date(info.row.original.expense_date);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    },
  },
  {
    id: 'attachments',
    header: 'Attachments',
    size: 120,
    cell: (info) => {
      const count = info.row.original.attachments?.length ?? 0;
      return (
        <span className={styles.attachmentCount}>
          <Paperclip size={13} />
          {count} file{count !== 1 ? 's' : ''}
        </span>
      );
    },
  },
  {
    id: 'status',
    header: 'Status',
    size: 130,
    cell: (info) => renderStatusBadge(info.row.original.reimb_status),
  },
  {
    id: 'actions',
    header: 'Action',
    size: 100,
    cell: (info) => {
      const isPending = info.row.original.reimb_status === ReimbursementStatus.PENDING;
      return (
        <div className={styles.actions}>
          {isPending && (
            <>
              <button
                className={styles.actionBtn}
                onClick={() => onEdit(info.row.original)}
                title="Edit"
              >
                <Pencil size={14} />
              </button>
              <button
                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                onClick={() => onDelete(info.row.original)}
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      );
    },
  },
];
