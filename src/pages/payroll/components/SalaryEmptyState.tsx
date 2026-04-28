import React from 'react';

import styles from '../PayrollEmployeeDetailPage.module.scss';

interface SalaryEmptyStateProps {
  onAssign: () => void;
}

export const SalaryEmptyState: React.FC<SalaryEmptyStateProps> = ({ onAssign }) => {
  return (
    <div className={styles.sectionCard}>
      <div className={styles.emptyState}>
        <p className={styles.emptyTitle}>No salary assigned yet</p>
        <p className={styles.emptySubtitle}>
          Assign a salary template to this employee to see the breakdown.
        </p>
        <button className={styles.assignButton} onClick={onAssign}>
          Assign Salary
        </button>
      </div>
    </div>
  );
};
