import { Eye } from 'lucide-react';

import { getInitials } from '../../../utils/stringUtils';
import { formatINR } from '../../../utils/numberUtils';

import styles from './employeePayrollColumns.module.scss';

import type { ColumnDef } from '@tanstack/react-table';
import type { EmployeeWithSalary } from '../types/payrollConfigTypes';

interface EmployeePayrollColumnsProps {
  onView: (employee: EmployeeWithSalary) => void;
}

export const employeePayrollColumns = ({
  onView,
}: EmployeePayrollColumnsProps): ColumnDef<EmployeeWithSalary>[] => [
  {
    id: 'employee',
    header: 'Employee',
    size: 240,
    cell: (info) => {
      const { name, employee_code } = info.row.original;
      return (
        <div className={styles.employeeCell}>
          <div className={styles.avatar}>{getInitials(name || '?')}</div>
          <div className={styles.employeeInfo}>
            <span className={styles.employeeName}>{name}</span>
            {employee_code && <span className={styles.employeeCode}>ID: {employee_code}</span>}
          </div>
        </div>
      );
    },
  },
  {
    id: 'annual_ctc',
    header: 'Annual CTC',
    size: 140,
    cell: (info) => (
      <span className={styles.amountCell}>{formatINR(info.row.original.annual_ctc)}</span>
    ),
  },
  {
    id: 'monthly_ctc',
    header: 'Monthly CTC',
    size: 140,
    cell: (info) => (
      <span className={styles.amountCell}>{formatINR(info.row.original.monthly_ctc)}</span>
    ),
  },
  {
    id: 'gross',
    header: 'Gross',
    size: 120,
    cell: (info) => <span className={styles.amountCell}>{formatINR(info.row.original.gross)}</span>,
  },
  {
    id: 'deductions',
    header: 'Deductions',
    size: 120,
    cell: (info) => (
      <span className={`${styles.amountCell} ${styles.deductionAmount}`}>
        {formatINR(info.row.original.deductions)}
      </span>
    ),
  },
  {
    id: 'take_home',
    header: 'Take Home',
    size: 130,
    cell: (info) => (
      <span className={`${styles.amountCell} ${styles.takeHomeAmount}`}>
        {formatINR(info.row.original.take_home)}
      </span>
    ),
  },
  {
    id: 'action',
    header: 'Action',
    size: 80,
    cell: (info) => (
      <button
        className={styles.viewButton}
        onClick={() => onView(info.row.original)}
        title="View details"
      >
        <Eye size={16} />
      </button>
    ),
  },
];
