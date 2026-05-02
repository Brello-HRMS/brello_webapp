import { Pencil } from 'lucide-react';

import { getInitials } from '../../../utils/stringUtils';
import { formatINR } from '../../../utils/numberUtils';
import { ReimbursementStatus } from '../types/reimbursementTypes';

import styles from './adminReimbursementColumns.module.scss';

import type { Reimbursement } from '../types/reimbursementTypes';
import type { ColumnDef } from '@tanstack/react-table';

interface AdminReimbursementColumnsProps {
  onEdit: (reimbursement: Reimbursement) => void;
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

export const adminReimbursementColumns = ({
  onEdit,
}: AdminReimbursementColumnsProps): ColumnDef<Reimbursement>[] => [
  {
    id: 'employee',
    header: 'Employee',
    size: 220,
    cell: (info) => {
      const emp = info.row.original.employee;
      const name = emp?.name ?? '—';
      return (
        <div className={styles.employeeCell}>
          <div className={styles.avatar}>{getInitials(name)}</div>
          <div className={styles.employeeInfo}>
            <span className={styles.employeeName}>{name}</span>
            {emp?.employee_code && (
              <span className={styles.employeeCode}>ID: {emp.employee_code}</span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    id: 'title',
    header: 'Title',
    size: 200,
    cell: (info) => info.row.original.title,
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
    id: 'amount',
    header: 'Amount',
    size: 120,
    cell: (info) => (
      <span className={styles.amountCell}>{formatINR(info.row.original.amount)}</span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    size: 130,
    cell: (info) => renderStatusBadge(info.row.original.reimb_status),
  },
  {
    id: 'is_paid',
    header: 'Paid',
    size: 80,
    cell: (info) => (
      <span className={styles.paidToggle}>
        {info.row.original.is_paid ? (
          <span style={{ color: 'var(--color-success-700)', fontWeight: 600, fontSize: 13 }}>
            Yes
          </span>
        ) : (
          <span style={{ color: 'var(--color-icon-gray)', fontSize: 13 }}>No</span>
        )}
      </span>
    ),
  },
  {
    id: 'action',
    header: 'Action',
    size: 80,
    cell: (info) => (
      <button
        className={styles.actionBtn}
        onClick={() => onEdit(info.row.original)}
        title="Edit reimbursement"
      >
        <Pencil size={15} />
      </button>
    ),
  },
];
