import React, { useMemo } from 'react';

import { DataTable } from '../../../../components/common/DataTable';
import { Button } from '../../../../components/common/Button/Button';
import { salaryComponentColumns } from '../../columns/salaryComponentColumns';

import styles from './SalaryComponents.module.scss';

import type { SalaryComponent } from '../../types/payrollConfigTypes';

interface SalaryComponentsProps {
  components: SalaryComponent[];
  onAddComponent: () => void;
  onEditComponent: (component: SalaryComponent) => void;
  onDeleteComponent: (component: SalaryComponent) => void;
}

export const SalaryComponents: React.FC<SalaryComponentsProps> = ({
  components,
  onAddComponent,
  onEditComponent,
  onDeleteComponent,
}) => {
  const sortedComponents = useMemo(() => {
    return [...components].sort((a, b) => {
      const isABasic = a.name.toLowerCase() === 'basic' || a.name.toLowerCase() === 'basic salary';
      const isBBasic = b.name.toLowerCase() === 'basic' || b.name.toLowerCase() === 'basic salary';

      if (isABasic && !isBBasic) return -1;
      if (!isABasic && isBBasic) return 1;
      return 0; // Keep original order for others
    });
  }, [components]);

  const columns = useMemo(
    () => salaryComponentColumns({ onEdit: onEditComponent, onDelete: onDeleteComponent }),
    [onEditComponent, onDeleteComponent],
  );

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Button variant="primary" onClick={onAddComponent}>
          + Add component
        </Button>
      </div>

      <DataTable columns={columns} data={sortedComponents} rowIdField="id" />
    </div>
  );
};
