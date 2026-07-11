import { useForm } from 'react-hook-form';

import { Button } from '../../../../components/common';

import styles from './WizardStep.module.scss';

import type { OfferDetailsParams, EmploymentType, WorkMode } from '../../types/offerTypes';

const EMPLOYMENT_TYPES: { label: string; value: EmploymentType }[] = [
  { label: 'Full Time', value: 'FULL_TIME' },
  { label: 'Part Time', value: 'PART_TIME' },
  { label: 'Contract', value: 'CONTRACT' },
  { label: 'Internship', value: 'INTERNSHIP' },
  { label: 'Consultant', value: 'CONSULTANT' },
];

const WORK_MODES: { label: string; value: WorkMode }[] = [
  { label: 'Onsite', value: 'ONSITE' },
  { label: 'Remote', value: 'REMOTE' },
  { label: 'Hybrid', value: 'HYBRID' },
];

interface Props {
  defaultValues: OfferDetailsParams;
  onBack: () => void;
  onNext: (data: OfferDetailsParams) => void;
}

export const Step2OfferDetails = ({ defaultValues, onBack, onNext }: Props) => {
  const { register, handleSubmit } = useForm<OfferDetailsParams>({ defaultValues });

  return (
    <form onSubmit={handleSubmit(onNext)} className={styles.stepBody}>
      <div className={styles.grid2}>
        <div className={styles.field}>
          <label className={styles.label}>Position / Role *</label>
          <input
            className={styles.input}
            {...register('position')}
            placeholder="Software Engineer"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Employment Type</label>
          <select className={styles.select} {...register('employment_type')}>
            <option value="">Select...</option>
            {EMPLOYMENT_TYPES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.grid2}>
        <div className={styles.field}>
          <label className={styles.label}>Joining Date</label>
          <input className={styles.input} type="date" {...register('joining_date')} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Work Mode</label>
          <select className={styles.select} {...register('work_mode')}>
            <option value="">Select...</option>
            {WORK_MODES.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.grid2}>
        <div className={styles.field}>
          <label className={styles.label}>Work Location</label>
          <input
            className={styles.input}
            {...register('work_location')}
            placeholder="Bengaluru, Karnataka"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Probation Period (days)</label>
          <input
            className={styles.input}
            type="number"
            min={0}
            {...register('probation_days', { valueAsNumber: true })}
            placeholder="90"
          />
        </div>
      </div>

      <div className={styles.grid2}>
        <div className={styles.field}>
          <label className={styles.label}>Notice Period (days)</label>
          <input
            className={styles.input}
            type="number"
            min={0}
            {...register('notice_period_days', { valueAsNumber: true })}
            placeholder="30"
          />
        </div>
      </div>

      <div className={styles.footer}>
        <Button variant="ghost" type="button" onClick={onBack}>
          ← Back
        </Button>
        <Button variant="primary" type="submit">
          Next: Compensation →
        </Button>
      </div>
    </form>
  );
};
