import { useForm, Controller } from 'react-hook-form';
import { Eye } from 'lucide-react';

import { Button } from '../../../../components/common';
import { Select } from '../../../../components/common/Select/Select';
import { useSalaryTemplates } from '../../../payroll/hooks/usePayrollConfig';
import { useDryRun } from '../../../payroll/hooks/useEmployeePayroll';

import styles from './WizardStep.module.scss';

import type { DryRunResult } from '../../../payroll/types/payrollConfigTypes';
import type { OfferCompensationParams, SalaryComponent } from '../../types/offerTypes';

function formatINR(amount: number) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

function DryRunResultPanel({ result }: { result: DryRunResult }) {
  return (
    <div
      className={styles.resultPanel}
      style={{
        marginTop: '20px',
        padding: '16px',
        background: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
      }}
    >
      <div
        className={styles.resultTitle}
        style={{ fontWeight: 600, marginBottom: '16px', fontSize: '14px' }}
      >
        Salary Preview — {result.metadata?.template_name}
      </div>
      {result.earnings.length > 0 && (
        <div className={styles.lineItemsSection} style={{ marginBottom: '16px' }}>
          <div
            className={styles.sectionLabel}
            style={{
              fontSize: '12px',
              color: '#64748b',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Earnings
          </div>
          {result.earnings.map((item) => (
            <div
              key={item.name}
              className={styles.lineItem}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
                fontSize: '14px',
              }}
            >
              <span className={styles.lineItemName}>{item.name}</span>
              <span className={styles.lineItemAmount}>{formatINR(item.calculated_value)}</span>
            </div>
          ))}
        </div>
      )}
      {result.deductions.length > 0 && (
        <div className={styles.lineItemsSection} style={{ marginBottom: '16px' }}>
          <div
            className={styles.sectionLabel}
            style={{
              fontSize: '12px',
              color: '#64748b',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Deductions
          </div>
          {result.deductions.map((item) => (
            <div
              key={item.name}
              className={styles.lineItem}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '8px',
                fontSize: '14px',
              }}
            >
              <span className={styles.lineItemName}>{item.name}</span>
              <span className={styles.lineItemAmount} style={{ color: '#ef4444' }}>
                -{formatINR(item.calculated_value)}
              </span>
            </div>
          ))}
        </div>
      )}
      <div
        className={styles.netSalaryRow}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontWeight: 600,
          paddingTop: '16px',
          borderTop: '1px solid #e2e8f0',
          fontSize: '15px',
        }}
      >
        <span>Net Salary / Month</span>
        <span>{formatINR(result.net / 12)}</span>
      </div>
    </div>
  );
}

interface Props {
  defaultValues: OfferCompensationParams;
  onBack: () => void;
  onNext: (data: OfferCompensationParams) => void;
}

export const Step3Compensation = ({ defaultValues, onBack, onNext }: Props) => {
  const { templates, isLoading: isLoadingTemplates } = useSalaryTemplates();
  const { runDryRun, dryRunResult, isCalculating, resetDryRun } = useDryRun();

  const { register, handleSubmit, control, getValues } = useForm<OfferCompensationParams>({
    defaultValues: {
      ...defaultValues,
      salary_structure_id: defaultValues.salary_structure_id ?? '',
    },
  });

  const templateOptions = templates.map((t) => ({
    value: t.id,
    label: t.name,
  }));

  const handlePreview = async () => {
    const values = getValues();
    if (!values.salary_structure_id || !values.ctc_annual) return;
    await runDryRun({
      template_id: values.salary_structure_id,
      ctc: Number(values.ctc_annual),
    });
  };

  const onSubmit = (data: OfferCompensationParams) => {
    if (dryRunResult) {
      // Map dry run results back to salary_components for the offer summary
      const components: SalaryComponent[] = [
        ...dryRunResult.earnings.map((e) => ({
          name: e.name,
          amount: e.calculated_value,
          type: 'fixed' as const,
        })),
        ...dryRunResult.deductions.map((d) => ({
          name: d.name,
          amount: d.calculated_value,
          type: 'fixed' as const,
        })),
      ];
      onNext({
        ...data,
        monthly_take_home: dryRunResult.net / 12,
        salary_components: components,
      });
    } else {
      // If preview hasn't been run, we can just pass what we have
      onNext(data);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.stepBody}>
      <div className={styles.grid2}>
        <div className={styles.field}>
          <Controller
            name="salary_structure_id"
            control={control}
            render={({ field }) => (
              <Select
                label="Salary Template"
                required
                placeholder={isLoadingTemplates ? 'Loading...' : 'Select a template...'}
                options={templateOptions}
                value={field.value ?? ''}
                onChange={(val) => {
                  field.onChange(val);
                  resetDryRun();
                }}
              />
            )}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Annual CTC (₹)</label>
          <input
            className={styles.input}
            type="number"
            min={0}
            step={1000}
            {...register('ctc_annual', { valueAsNumber: true })}
            placeholder="800000"
          />
        </div>
      </div>

      <div className={styles.previewSection} style={{ marginTop: '24px' }}>
        <Button variant="secondary" type="button" onClick={handlePreview} disabled={isCalculating}>
          <Eye size={15} style={{ marginRight: 6 }} />
          {isCalculating ? 'Calculating...' : 'Preview Salary Breakdown'}
        </Button>

        {dryRunResult && <DryRunResultPanel result={dryRunResult as DryRunResult} />}
      </div>

      <div className={styles.footer} style={{ marginTop: '32px' }}>
        <Button variant="ghost" type="button" onClick={onBack}>
          ← Back
        </Button>
        <Button variant="primary" type="submit">
          Next: Policies →
        </Button>
      </div>
    </form>
  );
};
