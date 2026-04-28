import React from 'react';

import styles from '../PayrollEmployeeDetailPage.module.scss';

import type { EmployeeSalaryComponent } from '../../../features/payroll/types/payrollConfigTypes';

interface ComponentGridProps {
  components: (EmployeeSalaryComponent & { displayValue?: number })[];
  isEditing: boolean;
  overrides: Record<string, number>;
  onOverrideChange: (name: string, value: number) => void;
  formatCurrency: (value: number) => string;
}

export const ComponentGrid: React.FC<ComponentGridProps> = ({
  components,
  isEditing,
  overrides,
  onOverrideChange,
  formatCurrency,
}) => {
  const sortedComponents = [...components].sort(
    (a, b) => a.calculation_priority - b.calculation_priority,
  );

  return (
    <div className={styles.fieldGrid}>
      {sortedComponents.map((component) => {
        const { component_name, is_residual, value } = component;
        const valueToShow = component.displayValue ?? overrides[component_name] ?? value;

        return (
          <div key={component_name} className={styles.fieldItem}>
            <span className={styles.fieldLabel}>
              {component_name}
              {!is_residual && <span>*</span>}
            </span>

            {isEditing ? (
              <input
                type="number"
                className={`${styles.editInput} ${is_residual ? styles.readOnlyInput : ''}`}
                value={valueToShow}
                onChange={(e) => onOverrideChange(component_name, Number(e.target.value))}
                disabled={is_residual}
                title={is_residual ? 'Auto-calculated based on CTC' : ''}
              />
            ) : (
              <div className={styles.fieldValue}>{formatCurrency(Number(valueToShow))}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};
