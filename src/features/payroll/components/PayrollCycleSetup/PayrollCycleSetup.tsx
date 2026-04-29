import React from 'react';
import { Info } from 'lucide-react';

import { Input } from '../../../../components/ui/Input/Input';
import { Select } from '../../../../components/common/Select/Select';
import { ToggleButton } from '../../../../components/common/ToggleButton/ToggleButton';

import styles from './PayrollCycleSetup.module.scss';

import type {
  PayrollCycleConfig,
  FinancialMonth,
  PayoutType,
  PayoutDayShift,
  AttendanceCutoffType,
} from '../../types/payrollConfigTypes';

const FINANCIAL_MONTH_OPTIONS = [
  { value: 'jan', label: 'January' },
  { value: 'feb', label: 'February' },
  { value: 'mar', label: 'March' },
  { value: 'apr', label: 'April' },
  { value: 'may', label: 'May' },
  { value: 'jun', label: 'June' },
  { value: 'jul', label: 'July' },
  { value: 'aug', label: 'August' },
  { value: 'sep', label: 'September' },
  { value: 'oct', label: 'October' },
  { value: 'nov', label: 'November' },
  { value: 'dec', label: 'December' },
];

const PAYOUT_TYPE_OPTIONS = [
  { value: 'last_working_day', label: 'Last Working Day' },
  { value: 'first_working_day', label: 'First Working Day' },
  { value: 'custom', label: 'Custom Date' },
];

const PAYOUT_DAY_SHIFT_OPTIONS = [
  { value: 'previous', label: 'Previous Working Day' },
  { value: 'next', label: 'Next Working Day' },
];

const ATTENDANCE_CUTOFF_TYPE_OPTIONS = [
  { value: 'days_before_month_end', label: 'Days Before Month End' },
  { value: 'fixed_date', label: 'Fixed Date' },
];

interface PayrollCycleSetupProps {
  config: PayrollCycleConfig | null;
  onChange: (updated: PayrollCycleConfig) => void;
}

const DEFAULT_CYCLE: PayrollCycleConfig = {
  financial_start_month: 'apr',
  payout_type: 'last_working_day',
  payout_date: null,
  payout_day_shift: null,
  consider_holidays: true,
  attendance_cutoff_type: 'days_before_month_end',
  attendance_cutoff_value: 4,
};

export const PayrollCycleSetup: React.FC<PayrollCycleSetupProps> = ({ config, onChange }) => {
  const currentConfig = config || DEFAULT_CYCLE;

  const handleChange = <K extends keyof PayrollCycleConfig>(
    key: K,
    value: PayrollCycleConfig[K],
  ) => {
    onChange({ ...currentConfig, [key]: value });
  };

  const isCustomPayout = currentConfig.payout_type === 'custom';
  const cutoffLabel =
    currentConfig.attendance_cutoff_type === 'days_before_month_end'
      ? 'Days Before Month End*'
      : 'Fixed Cut-off Date (day of month)*';

  return (
    <div className={styles.container}>
      <div className={styles.row3}>
        <Select
          label="Financial Year Start Month"
          required
          options={FINANCIAL_MONTH_OPTIONS}
          value={currentConfig.financial_start_month}
          onChange={(val) => handleChange('financial_start_month', val as FinancialMonth)}
        />
        <Select
          label="Payout Type"
          required
          options={PAYOUT_TYPE_OPTIONS}
          value={currentConfig.payout_type}
          onChange={(val) => {
            const next = val as PayoutType;
            onChange({
              ...currentConfig,
              payout_type: next,
              payout_date: next !== 'custom' ? null : currentConfig.payout_date,
              payout_day_shift: next !== 'custom' ? null : currentConfig.payout_day_shift,
            });
          }}
        />
        <Select
          label="Attendance Cutoff Type"
          required
          options={ATTENDANCE_CUTOFF_TYPE_OPTIONS}
          value={currentConfig.attendance_cutoff_type}
          onChange={(val) => handleChange('attendance_cutoff_type', val as AttendanceCutoffType)}
        />
        <Input
          label={cutoffLabel}
          type="number"
          value={currentConfig.attendance_cutoff_value || 0}
          onChange={(e) => handleChange('attendance_cutoff_value', Number(e.target.value))}
        />
      </div>

      {isCustomPayout && (
        <div className={styles.row2}>
          <Input
            label="Payout Date (1–31)*"
            type="number"
            value={currentConfig.payout_date ?? ''}
            onChange={(e) => handleChange('payout_date', Number(e.target.value))}
          />
          <Select
            label="If Holiday Falls On Payout Date"
            options={PAYOUT_DAY_SHIFT_OPTIONS}
            value={currentConfig.payout_day_shift ?? ''}
            onChange={(val) => handleChange('payout_day_shift', val as PayoutDayShift)}
          />
        </div>
      )}

      <div className={styles.toggleRow}>
        <span className={styles.toggleLabel}>Consider public holidays in payout scheduling</span>
        <ToggleButton
          checked={currentConfig.consider_holidays}
          onChange={(checked) => handleChange('consider_holidays', checked)}
        />
      </div>

      <div className={styles.infoBanner}>
        <Info size={16} className={styles.infoIcon} />
        <span>Payroll reminders are automatically triggered before payout</span>
      </div>
    </div>
  );
};
