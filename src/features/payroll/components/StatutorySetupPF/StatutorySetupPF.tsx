import React from 'react';
import { Info } from 'lucide-react';

import { Input } from '../../../../components/ui/Input/Input';
import { DatePicker } from '../../../../components/ui/DatePicker/DatePicker';
import { ToggleButton } from '../../../../components/common/ToggleButton/ToggleButton';

import styles from './StatutorySetupPF.module.scss';

import type { StatutoryPFConfig } from '../../types/payrollConfigTypes';

interface StatutorySetupPFProps {
  config: StatutoryPFConfig | null;
  onChange: (updated: StatutoryPFConfig) => void;
}

const DEFAULT_PF: StatutoryPFConfig = {
  employee_contribution: 12,
  employer_contribution: 12,
  minimum_salary_threshold: 15000,
  is_enabled: true,
  effective_from: new Date().toISOString().split('T')[0],
};

export const StatutorySetupPF: React.FC<StatutorySetupPFProps> = ({ config, onChange }) => {
  const currentConfig = config || DEFAULT_PF;

  const handleChange = <K extends keyof StatutoryPFConfig>(key: K, value: StatutoryPFConfig[K]) => {
    onChange({ ...currentConfig, [key]: value });
  };

  return (
    <div className={styles.container}>
      <div className={styles.row3}>
        <Input
          label="Employee Contribution (%)*"
          type="number"
          value={currentConfig.employee_contribution || 0}
          onChange={(e) => handleChange('employee_contribution', Number(e.target.value))}
        />
        <Input
          label="Employer Contribution (%)*"
          type="number"
          value={currentConfig.employer_contribution || 0}
          onChange={(e) => handleChange('employer_contribution', Number(e.target.value))}
        />
        <Input
          label="Minimum Salary Threshold (₹)*"
          type="number"
          value={currentConfig.minimum_salary_threshold || 0}
          onChange={(e) => handleChange('minimum_salary_threshold', Number(e.target.value))}
        />
      </div>

      <div className={styles.row2}>
        <DatePicker
          label="Effective From*"
          required
          value={currentConfig.effective_from || ''}
          onChange={(val) => handleChange('effective_from', val)}
        />
      </div>

      <div className={styles.toggleRow}>
        <span className={styles.toggleLabel}>Enable Provident Fund (PF)</span>
        <ToggleButton
          checked={currentConfig.is_enabled}
          onChange={(checked) => handleChange('is_enabled', checked)}
        />
      </div>

      <div className={styles.infoBanner}>
        <Info size={16} className={styles.infoIcon} />
        <span>
          PF is calculated on Basic Salary. Employer contribution includes EPF (3.67%) and EPS
          (8.33%) per EPFO rules. Saving creates a new versioned config — existing assignments are
          unaffected.
        </span>
      </div>
    </div>
  );
};
