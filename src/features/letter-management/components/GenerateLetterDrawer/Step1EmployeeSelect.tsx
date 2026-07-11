import React, { useMemo } from 'react';

import { Select } from '../../../../components/common';
import { useEmployeeSearch } from '../../hooks/useIssuedLetters';

import styles from './GenerateLetterDrawer.module.scss';

interface Step1EmployeeSelectProps {
  selectedEmployeeId?: string;
  onSelect: (id: string) => void;
}

export const Step1EmployeeSelect: React.FC<Step1EmployeeSelectProps> = ({
  selectedEmployeeId,
  onSelect,
}) => {
  const { data: response, isLoading } = useEmployeeSearch();

  const employeeOptions = useMemo(
    () =>
      (response?.data || []).map((employee) => ({
        label: `${employee.name}${employee.profile?.employee_id ? ' — ' + employee.profile.employee_id : ''}`,
        value: employee.id,
      })),
    [response],
  );

  return (
    <div className={styles.stepContainer}>
      <h3 className={styles.stepTitle}>Select Employee</h3>
      <p className={styles.stepDescription}>
        Choose the employee for whom you want to generate a letter.
      </p>
      <Select
        label="Employee"
        placeholder={isLoading ? 'Loading employees...' : 'Search and select an employee'}
        options={employeeOptions}
        value={selectedEmployeeId}
        onChange={(value) => onSelect(value as string)}
        disabled={isLoading}
        required
      />
    </div>
  );
};

export default Step1EmployeeSelect;
