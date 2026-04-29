import React, { useEffect } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye } from 'lucide-react';

import { assignSalarySchema } from '../../validation/payrollSchema';
import { useAssignSalary, useDryRun } from '../../hooks/useEmployeePayroll';
import { Input } from '../../../../components/ui/Input/Input';
import { DatePicker } from '../../../../components/ui/DatePicker/DatePicker';
import { Select, type SelectOption } from '../../../../components/common/Select/Select';
import { Button } from '../../../../components/common/Button/Button';
import { Dialog } from '../../../../components/common/Dialog/Dialog';

import styles from './AssignSalaryModal.module.scss';

import type {
  AssignSalaryFormData,
  DryRunResult,
  EmployeeWithSalary,
  SalaryTemplate,
} from '../../types/payrollConfigTypes';

interface AssignSalaryModalProps {
  isOpen: boolean;
  employee: EmployeeWithSalary | null;
  templates: SalaryTemplate[];
  onClose: () => void;
  onSaved?: () => void;
}

function formatINR(amount: number) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

function DryRunResultPanel({ result }: { result: DryRunResult }) {
  return (
    <div className={styles.resultPanel}>
      <div className={styles.resultTitle}>Salary Preview — {result.metadata?.template_name}</div>

      {result.earnings.length > 0 && (
        <div className={styles.lineItemsSection}>
          <div className={styles.sectionLabel}>Earnings</div>
          {result.earnings.map((item) => (
            <div key={item.name} className={styles.lineItem}>
              <span className={styles.lineItemName}>{item.name}</span>
              <span className={`${styles.lineItemAmount} ${styles.earning}`}>
                {formatINR(item.calculated_value)}
              </span>
            </div>
          ))}
        </div>
      )}

      {result.deductions.length > 0 && (
        <div className={styles.lineItemsSection}>
          <div className={styles.sectionLabel}>Deductions</div>
          {result.deductions.map((item) => (
            <div key={item.name} className={styles.lineItem}>
              <span className={styles.lineItemName}>{item.name}</span>
              <span className={`${styles.lineItemAmount} ${styles.deduction}`}>
                -{formatINR(item.calculated_value)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.netSalaryRow}>
        <span className={styles.netSalaryLabel}>Net Salary / Month</span>
        <span className={styles.netSalaryAmount}>{formatINR(result.net / 12)}</span>
      </div>

      {result.warnings?.map((w, i) => (
        <div key={i} className={styles.warningItem}>
          ⚠ {w}
        </div>
      ))}
    </div>
  );
}

export const AssignSalaryModal: React.FC<AssignSalaryModalProps> = ({
  isOpen,
  employee,
  templates,
  onClose,
  onSaved,
}) => {
  const { assignSalary, isAssigning } = useAssignSalary();
  const { runDryRun, dryRunResult, isCalculating, resetDryRun } = useDryRun();

  const {
    register,
    handleSubmit,
    control,
    reset,
    getValues,
    formState: { errors },
  } = useForm<AssignSalaryFormData>({
    resolver: zodResolver(assignSalarySchema),
    defaultValues: {
      templateId: '',
      ctc: '',
      effectiveFrom: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        templateId: '',
        ctc: '',
        effectiveFrom: new Date().toISOString().split('T')[0],
      });
      resetDryRun();
    }
  }, [isOpen, reset, resetDryRun]);

  const templateOptions: SelectOption[] = templates.map((t) => ({
    value: t.id,
    label: t.name,
  }));

  const handlePreview = async () => {
    const values = getValues();
    if (!values.templateId || !values.ctc) return;
    await runDryRun({
      template_id: values.templateId,
      ctc: Number(values.ctc),
    });
  };

  const onSubmit: SubmitHandler<AssignSalaryFormData> = async (data) => {
    if (!employee) return;
    await assignSalary({
      user_id: employee.id,
      template_id: data.templateId,
      ctc: Number(data.ctc),
      effective_from: data.effectiveFrom,
    });
    onSaved?.();
    onClose();
  };

  const employeeName = employee?.name ?? '';

  return (
    <Dialog
      title={`Assign Salary — ${employeeName}`}
      open={isOpen}
      onClose={onClose}
      maxWidth="520px"
      position="right"
      actions={
        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit(onSubmit)} disabled={isAssigning}>
            {isAssigning ? 'Assigning...' : 'Assign Salary'}
          </Button>
        </div>
      }
    >
      <div className={styles.formBody}>
        <Controller
          name="templateId"
          control={control}
          render={({ field }) => (
            <Select
              label="Salary Template"
              required
              placeholder="Select a template..."
              options={templateOptions}
              value={field.value}
              onChange={field.onChange}
              error={errors.templateId?.message}
            />
          )}
        />

        <Input
          label="Annual CTC (₹)*"
          type="number"
          placeholder="e.g. 600000"
          error={errors.ctc?.message}
          {...register('ctc')}
        />

        <Controller
          name="effectiveFrom"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Effective From*"
              required
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />

        <hr className={styles.previewDivider} />

        <div className={styles.previewSection}>
          <Button variant="secondary" onClick={handlePreview} disabled={isCalculating}>
            <Eye size={15} style={{ marginRight: 6 }} />
            {isCalculating ? 'Calculating...' : 'Preview Salary Breakdown'}
          </Button>

          {dryRunResult && <DryRunResultPanel result={dryRunResult as DryRunResult} />}
        </div>
      </div>
    </Dialog>
  );
};
