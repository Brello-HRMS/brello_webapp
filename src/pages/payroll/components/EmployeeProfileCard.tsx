import React from 'react';
import { Pencil } from 'lucide-react';

import styles from '../PayrollEmployeeDetailPage.module.scss';

import type { EmployeeSalaryStructure } from '../../../features/payroll/types/payrollConfigTypes';

interface EmployeeProfileCardProps {
  emp: EmployeeSalaryStructure['employee'] | undefined;
  hasSalary: boolean;
  salaryStructure: EmployeeSalaryStructure | null | undefined;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  formatINR: (val: number | string | null | undefined) => string;
  getInitials: (name: string) => string;
}

export const EmployeeProfileCard: React.FC<EmployeeProfileCardProps> = ({
  emp,
  hasSalary,
  salaryStructure,
  isEditing,
  onStartEdit,
  onCancelEdit,
  formatINR,
  getInitials,
}) => {
  return (
    <div className={styles.profileCard}>
      <div className={styles.profileLeft}>
        <div className={styles.avatar}>{getInitials(emp?.name || '?')}</div>
        <div className={styles.profileMeta}>
          <h2 className={styles.profileName}>{emp?.name ?? '—'}</h2>
          {emp?.department && <span className={styles.profileSub}>{emp.department}</span>}
          <div className={styles.profileBadges}>
            {emp?.employee_code && <span className={styles.idBadge}>ID: {emp.employee_code}</span>}
            {hasSalary ? (
              <span className={styles.statusBadgeActive}>● Active</span>
            ) : (
              <span className={styles.statusBadgeNone}>● No Salary</span>
            )}
            {hasSalary && salaryStructure?.ctc && (
              <span className={styles.idBadge}>Annual CTC: {formatINR(salaryStructure.ctc)}</span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.headerActions}>
        {isEditing ? (
          <button className={styles.cancelButton} onClick={onCancelEdit}>
            Cancel
          </button>
        ) : (
          <button className={styles.editButton} onClick={onStartEdit}>
            <Pencil size={15} />
            {hasSalary ? 'Edit' : 'Assign Salary'}
          </button>
        )}
      </div>
    </div>
  );
};
