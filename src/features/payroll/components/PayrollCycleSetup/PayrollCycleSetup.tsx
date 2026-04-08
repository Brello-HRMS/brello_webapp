import React from 'react';
import { Info } from 'lucide-react';

import { Input } from '../../../../components/ui/Input/Input';
import { DatePicker } from '../../../../components/ui/DatePicker/DatePicker';
import { Select } from '../../../../components/common/Select/Select';

import styles from './PayrollCycleSetup.module.scss';

import type { PayrollCycleConfig } from '../../types/payrollConfigTypes';

const FREQUENCY_OPTIONS = [{ value: 'monthly', label: 'Monthly' }];

interface PayrollCycleSetupProps {
  config: PayrollCycleConfig | null;
  onChange: (updated: PayrollCycleConfig) => void;
}

const DEFAULT_CYCLE: PayrollCycleConfig = {
  frequency: 'monthly',
  start_date: new Date().toISOString().split('T')[0],
  cutoff_day: 25,
  payout_day: 31,
  payslip_release_day: 31,
};

export const PayrollCycleSetup: React.FC<PayrollCycleSetupProps> = ({ config, onChange }) => {
  const currentConfig = config || DEFAULT_CYCLE;

  const handleChange = <K extends keyof PayrollCycleConfig>(
    key: K,
    value: PayrollCycleConfig[K],
  ) => {
    onChange({ ...currentConfig, [key]: value });
  };

  const calculateYearEnd = (startDate: string) => {
    if (!startDate) return '';
    const date = new Date(startDate);
    date.setFullYear(date.getFullYear() + 1);
    // Subtract one day to get the end of the financial year
    date.setDate(date.getDate() - 1);
    return date.toISOString().split('T')[0];
  };

  const financialYearEnd = calculateYearEnd(currentConfig.start_date);

  return (
    <div className={styles.container}>
      <div className={styles.row3}>
        <Select
          label="Payroll Frequency"
          required
          options={FREQUENCY_OPTIONS}
          value={currentConfig.frequency}
          onChange={(val) => handleChange('frequency', val as PayrollCycleConfig['frequency'])}
          disabled
        />
        <DatePicker
          label="Financial Year Start"
          required
          value={currentConfig.start_date || ''}
          onChange={(val) => handleChange('start_date', val)}
        />
        <DatePicker
          label="Financial Year End"
          value={financialYearEnd}
          disabled
          onChange={() => {}}
        />
        <Input
          label="Attendance Cut Off day*"
          type="number"
          value={currentConfig.cutoff_day || 0}
          onChange={(e) => handleChange('cutoff_day', Number(e.target.value))}
        />
      </div>

      <div className={styles.row2}>
        <div>
          <Input
            label="Payout Day*"
            type="number"
            value={currentConfig.payout_day || 0}
            onChange={(e) => handleChange('payout_day', Number(e.target.value))}
          />
          <span className={styles.helperText}>Salary released on this day</span>
        </div>
        <div>
          <Input
            label="Payslip Release Day*"
            type="number"
            value={currentConfig.payout_day || 0}
            disabled
          />
          <span className={styles.helperText}>Auto-synced with payout</span>
        </div>
      </div>

      <div className={styles.infoBanner}>
        <Info size={16} className={styles.infoIcon} />
        <span>Payroll reminders are automatically triggered before payout</span>
      </div>
    </div>
  );
};
