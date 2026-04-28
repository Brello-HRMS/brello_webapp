import React from 'react';

import { Input } from '../../../components/ui/Input/Input';
import { DatePicker } from '../../../components/ui/DatePicker/DatePicker';
import { Select, type SelectOption } from '../../../components/common/Select/Select';
import {
  MultiSelect,
  type MultiSelectOption,
} from '../../../components/common/MultiSelect/MultiSelect';
import styles from '../PayrollEmployeeDetailPage.module.scss';

import { SalaryInfoBanner } from './SalaryInfoBanner';

import type { EmployeeSalaryComponent } from '../../../features/payroll/types/payrollConfigTypes';

interface SalaryEditPanelProps {
  hasSalary: boolean;
  templateOptions: SelectOption[];
  templateId: string;
  onTemplateChange: (val: string) => void;
  componentOptions: MultiSelectOption[];
  selectedComponentIds: string[];
  onComponentIdsChange: (val: string[]) => void;
  ctc: string;
  onCtcChange: (val: string) => void;
  onCalculate: () => void;
  effectiveFrom: string;
  onEffectiveFromChange: (val: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isAssigning: boolean;
  previewComponents: EmployeeSalaryComponent[] | null;
  isExceedingCtc: boolean;
  hasAutoAdjustedResidual: boolean;
  totalEarnings: number;
  formatCurrency: (val: number) => string;
}

export const SalaryEditPanel: React.FC<SalaryEditPanelProps> = ({
  hasSalary,
  templateOptions,
  templateId,
  onTemplateChange,
  componentOptions,
  selectedComponentIds,
  onComponentIdsChange,
  ctc,
  onCtcChange,
  onCalculate,
  effectiveFrom,
  onEffectiveFromChange,
  onSave,
  onCancel,
  isAssigning,
  previewComponents,
  isExceedingCtc,
  hasAutoAdjustedResidual,
  totalEarnings,
  formatCurrency,
}) => {
  return (
    <div className={styles.editPanel}>
      <div className={styles.editPanelTitle}>
        {hasSalary ? 'Update Salary' : 'Assign Salary'} — enter CTC to auto-calculate components
      </div>
      <div className={styles.editPanelRow}>
        <Select
          label="Salary Template*"
          required
          placeholder="Select template..."
          options={templateOptions}
          value={templateId}
          onChange={(v) => onTemplateChange(v as string)}
        />
        <MultiSelect
          label="Salary Components*"
          required
          placeholder="Select components..."
          options={componentOptions}
          value={selectedComponentIds}
          onChange={(v) => onComponentIdsChange(v as string[])}
          disabled={!templateId}
        />
        <Input
          label="Annual CTC (₹)*"
          type="number"
          placeholder="e.g. 600000"
          value={ctc}
          onChange={(e) => onCtcChange(e.target.value)}
        />
        <button className={styles.calcButton} onClick={onCalculate}>
          Calculate
        </button>
      </div>
      <div className={styles.effectiveDateRow}>
        <DatePicker
          label="Effective From*"
          required
          value={effectiveFrom}
          onChange={onEffectiveFromChange}
        />
      </div>
      <div className={styles.saveRow}>
        <button className={styles.cancelButton} onClick={onCancel}>
          Cancel
        </button>
        <button
          className={styles.saveButton}
          onClick={onSave}
          disabled={isAssigning || !previewComponents || isExceedingCtc}
        >
          {isAssigning ? 'Saving...' : 'Save'}
        </button>
      </div>

      <SalaryInfoBanner
        isExceedingCtc={isExceedingCtc}
        hasAutoAdjustedResidual={hasAutoAdjustedResidual}
        totalEarnings={totalEarnings}
        ctc={ctc}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};
