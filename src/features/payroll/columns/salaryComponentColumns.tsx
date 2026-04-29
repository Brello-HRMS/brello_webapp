import { Pencil, Trash2 } from 'lucide-react';

import styles from '../components/SalaryComponents/SalaryComponents.module.scss';

import type { ColumnDef } from '@tanstack/react-table';
import type { SalaryComponent } from '../types/payrollConfigTypes';

interface SalaryComponentColumnsProps {
  onEdit: (component: SalaryComponent) => void;
  onDelete: (component: SalaryComponent) => void;
}

export const salaryComponentColumns = ({
  onEdit,
  onDelete,
}: SalaryComponentColumnsProps): ColumnDef<SalaryComponent>[] => [
  {
    accessorKey: 'name',
    header: 'Component Name',
    size: 250,
    cell: (info) => <span className={styles.componentName}>{info.getValue() as string}</span>,
  },
  {
    accessorKey: 'type',
    header: 'Type',
    size: 130,
    cell: (info) => {
      const type = info.getValue() as string;
      const isEarning = type === 'earning';
      return (
        <span
          className={`${styles.priorityBadge} ${isEarning ? styles.earning : styles.deduction}`}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
      );
    },
  },
  {
    accessorKey: 'calculation_type',
    header: 'Calc Type',
    size: 130,
    cell: (info) => {
      const val = info.getValue() as string;
      return <span className={styles.typeCell}>{val.charAt(0).toUpperCase() + val.slice(1)}</span>;
    },
  },
  {
    id: 'value',
    header: 'Value',
    size: 180,
    cell: (info) => {
      const component = info.row.original;
      const isFixed = component.calculation_type === 'fixed';
      const value = component.calculation_value?.value || 0;
      const base = component.calculation_value?.base || 'CTC';

      if (isFixed) {
        return <span className={styles.amountCell}>₹{value.toLocaleString()}</span>;
      }
      return (
        <span className={styles.percentageCell}>
          {value}% of {base}
        </span>
      );
    },
  },
  {
    accessorKey: 'is_taxable',
    header: 'Taxable',
    size: 100,
    cell: (info) => (
      <span className={styles.taxableCell}>{(info.getValue() as boolean) ? 'Yes' : 'No'}</span>
    ),
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    size: 120,
    cell: (info) => {
      const isActive = info.getValue() as boolean;
      return (
        <span className={`${styles.statusBadge} ${isActive ? styles.active : styles.inactive}`}>
          ● {isActive ? 'Active' : 'Inactive'}
        </span>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    size: 80,
    cell: (info) => (
      <div className={styles.actionsContainer}>
        <button
          className={styles.editButton}
          onClick={() => onEdit(info.row.original)}
          aria-label="Edit"
        >
          <Pencil size={16} />
        </button>
        {!info.row.original.is_system_defined && (
          <button
            className={styles.deleteButton}
            onClick={() => onDelete(info.row.original)}
            aria-label="Delete"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    ),
  },
];
