import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '../../../../components/common';

import styles from './WizardStep.module.scss';

import type { OfferCompensationParams, SalaryComponent } from '../../types/offerTypes';

interface FormData extends OfferCompensationParams {
  salary_components: SalaryComponent[];
}

interface Props {
  defaultValues: OfferCompensationParams;
  onBack: () => void;
  onNext: (data: OfferCompensationParams) => void;
}

export const Step3Compensation = ({ defaultValues, onBack, onNext }: Props) => {
  const { register, handleSubmit, control } = useForm<FormData>({
    defaultValues: {
      ...defaultValues,
      salary_components: defaultValues.salary_components ?? [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'salary_components' });

  const ctc = useWatch({ control, name: 'ctc_annual' }) ?? 0;
  const componentsTotal = (useWatch({ control, name: 'salary_components' }) ?? []).reduce(
    (sum, c) => sum + (c.amount ?? 0) * 12,
    0,
  );

  return (
    <form onSubmit={handleSubmit(onNext)} className={styles.stepBody}>
      <div className={styles.grid2}>
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
        <div className={styles.field}>
          <label className={styles.label}>Monthly Take-Home (₹)</label>
          <input
            className={styles.input}
            type="number"
            min={0}
            step={500}
            {...register('monthly_take_home', { valueAsNumber: true })}
            placeholder="55000"
          />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>Salary Breakdown</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: '', amount: 0, type: 'fixed' })}
          >
            <Plus size={14} /> Add Component
          </Button>
        </div>

        {fields.length === 0 && (
          <p className={styles.hint}>
            Add salary components like Basic, HRA, Special Allowance to generate a salary table in
            the offer.
          </p>
        )}

        <div className={styles.componentList}>
          {fields.map((field, index) => (
            <div key={field.id} className={styles.componentRow}>
              <input
                className={`${styles.input} ${styles.flex2}`}
                {...register(`salary_components.${index}.name`)}
                placeholder="Basic Salary"
              />
              <select
                className={`${styles.select} ${styles.flex1}`}
                {...register(`salary_components.${index}.type`)}
              >
                <option value="fixed">Fixed</option>
                <option value="variable">Variable</option>
              </select>
              <input
                className={`${styles.input} ${styles.flex1}`}
                type="number"
                min={0}
                step={100}
                {...register(`salary_components.${index}.amount`, { valueAsNumber: true })}
                placeholder="Monthly ₹"
              />
              <button type="button" className={styles.removeBtn} onClick={() => remove(index)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {fields.length > 0 && (
          <div className={styles.ctcSummary}>
            <span>Annual from components:</span>
            <strong>₹{componentsTotal.toLocaleString('en-IN')}</strong>
            {ctc > 0 && componentsTotal !== ctc && (
              <span className={styles.mismatch}>
                (Mismatch with CTC: ₹{(ctc - componentsTotal).toLocaleString('en-IN')} unallocated)
              </span>
            )}
          </div>
        )}
      </div>

      <div className={styles.footer}>
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
