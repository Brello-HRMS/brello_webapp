import { Pencil, Trash2 } from 'lucide-react';

import styles from '../components/SalaryComponents/SalaryComponents.module.scss';

import type { ColumnDef } from '@tanstack/react-table';
import type { SalaryComponent } from '../types/payrollConfigTypes';

interface SalaryComponentColumnsProps {
  components: SalaryComponent[];
  onEdit: (component: SalaryComponent) => void;
  onDelete: (component: SalaryComponent) => void;
}

const TYPE_STYLE: Record<string, string> = {
  earning: styles.earning,
  deduction: styles.deduction,
  bonus: styles.bonus,
};

export const salaryComponentColumns = ({
  components,
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
    accessorKey: 'component_type',
    header: 'Type',
    size: 130,
    cell: (info) => {
      const type = info.getValue() as string;
      return (
        <span className={`${styles.priorityBadge} ${TYPE_STYLE[type] ?? ''}`}>
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
      const isResidual = component.calculation_type === 'residual';
      const val = component.value ?? 0;

      if (isFixed) {
        return <span className={styles.amountCell}>₹{Number(val).toLocaleString()}</span>;
      }
      if (isResidual) {
        return <span className={styles.typeCell}>Residual</span>;
      }
      const baseName =
        component.base_component?.name ??
        components.find((c) => c.id === component.calculate_from)?.name ??
        'CTC';
      return (
        <span className={styles.percentageCell}>
          {val}% of {baseName}
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
        {!info.row.original.is_default && (
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
