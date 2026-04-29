import React from 'react';
import { Info } from 'lucide-react';

import { Input } from '../../../../components/ui/Input/Input';
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
  min_salary_threshold: 15000,
  wage_ceiling: 15000,
  salary_ceiling_enabled: true,
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
          value={currentConfig.min_salary_threshold || 0}
          onChange={(e) => handleChange('min_salary_threshold', Number(e.target.value))}
        />
      </div>

      <div className={styles.row1half}>
        <Input
          label="Wage Ceiling (₹)*"
          type="number"
          value={currentConfig.wage_ceiling || 0}
          onChange={(e) => handleChange('wage_ceiling', Number(e.target.value))}
        />
      </div>

      <div className={styles.toggleRow}>
        <span className={styles.toggleLabel}>Apply wage ceiling for PF calculation</span>
        <ToggleButton
          checked={currentConfig.salary_ceiling_enabled || false}
          onChange={(checked) => handleChange('salary_ceiling_enabled', checked)}
        />
      </div>

      <div className={styles.infoBanner}>
        <Info size={16} className={styles.infoIcon} />
        <span>
          PF is calculated on Basic Salary. Employer contribution includes EPF (3.67) and EPS
          (8.33%) components per EPFO rules.
        </span>
      </div>
    </div>
  );
};
