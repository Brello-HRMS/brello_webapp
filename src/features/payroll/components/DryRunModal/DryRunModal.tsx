import React, { useState, useEffect } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, ChevronUp } from 'lucide-react';

import { dryRunSchema } from '../../validation/payrollSchema';
import { useDryRun } from '../../hooks/useEmployeePayroll';
import { Input } from '../../../../components/ui/Input/Input';
import { Select, type SelectOption } from '../../../../components/common/Select/Select';
import { Button } from '../../../../components/common/Button/Button';
import { Dialog } from '../../../../components/common/Dialog/Dialog';

import styles from './DryRunModal.module.scss';

import type {
  DryRunFormData,
  DryRunResult,
  SalaryTemplate,
  EmployeeWithSalary,
} from '../../types/payrollConfigTypes';

interface DryRunModalProps {
  isOpen: boolean;
  templates: SalaryTemplate[];
  employee?: EmployeeWithSalary | null;
  onClose: () => void;
}

function formatINR(amount: number) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

function ResultPanel({ result }: { result: DryRunResult }) {
  return (
    <div className={styles.resultPanel}>
      <div className={styles.resultTitle}>
        Preview — {result.metadata?.template_name}
        {result.metadata?.sample_period ? ` · ${result.metadata.sample_period}` : ''}
      </div>

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

      <div className={styles.summaryGrid}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Annual Gross</span>
          <span className={styles.summaryValue}>{formatINR(result.gross)}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Annual Deductions</span>
          <span className={styles.summaryValue} style={{ color: 'var(--color-error-700)' }}>
            -{formatINR(result.deductions_total)}
          </span>
        </div>
      </div>

      <div className={styles.netSalaryRow}>
        <span className={styles.netSalaryLabel}>Annual Net</span>
        <span className={styles.netSalaryAmount}>{formatINR(result.net)}</span>
      </div>

      {result.warnings?.map((w, i) => (
        <div key={i} className={styles.warningItem}>
          ⚠ {w}
        </div>
      ))}

      {result.metadata?.simulated_at && (
        <div className={styles.metaBanner}>
          Simulated at {new Date(result.metadata.simulated_at).toLocaleString()} ·{' '}
          {result.metadata.currency}
        </div>
      )}
    </div>
  );
}

export const DryRunModal: React.FC<DryRunModalProps> = ({
  isOpen,
  templates,
  employee,
  onClose,
}) => {
  const { runDryRun, dryRunResult, isCalculating, resetDryRun } = useDryRun();
  const [showOptional, setShowOptional] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<DryRunFormData>({
    resolver: zodResolver(dryRunSchema),
    defaultValues: {
      templateId: '',
      ctc: '',
      bonus: '',
      loanEmi: '',
      lwpDays: '',
      otherDeductions: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        templateId: '',
        ctc: '',
        bonus: '',
        loanEmi: '',
        lwpDays: '',
        otherDeductions: '',
      });
      resetDryRun();
      setTimeout(() => setShowOptional(false), 0);
    }
  }, [isOpen, reset, resetDryRun]);

  const templateOptions: SelectOption[] = templates.map((t) => ({
    value: t.id,
    label: t.name,
  }));

  const onSubmit: SubmitHandler<DryRunFormData> = async (data) => {
    await runDryRun({
      template_id: data.templateId,
      ctc: Number(data.ctc),
      bonus: data.bonus ? Number(data.bonus) : undefined,
      loan_emi: data.loanEmi ? Number(data.loanEmi) : undefined,
      lwp_days: data.lwpDays ? Number(data.lwpDays) : undefined,
      other_deductions: data.otherDeductions ? Number(data.otherDeductions) : undefined,
    });
  };

  const title = employee ? `Salary Preview — ${employee.name}` : 'Salary Dry Run Preview';

  return (
    <Dialog
      title={title}
      open={isOpen}
      onClose={onClose}
      maxWidth="560px"
      position="right"
      actions={
        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSubmit(onSubmit)} disabled={isCalculating}>
            {isCalculating ? 'Calculating...' : 'Calculate Preview'}
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

        <div className={styles.optionalSection}>
          <div className={styles.optionalHeader} onClick={() => setShowOptional((v) => !v)}>
            <span className={styles.optionalTitle}>Optional Adjustments</span>
            <button className={styles.optionalToggle} type="button">
              {showOptional ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {showOptional && (
            <div className={styles.optionalFields}>
              <Input label="Bonus (₹)" type="number" placeholder="0" {...register('bonus')} />
              <Input label="Loan EMI (₹)" type="number" placeholder="0" {...register('loanEmi')} />
              <Input label="LWP Days" type="number" placeholder="0" {...register('lwpDays')} />
              <Input
                label="Other Deductions (₹)"
                type="number"
                placeholder="0"
                {...register('otherDeductions')}
              />
            </div>
          )}
        </div>

        {dryRunResult && (
          <>
            <hr className={styles.divider} />
            <ResultPanel result={dryRunResult as DryRunResult} />
          </>
        )}
      </div>
    </Dialog>
  );
};
