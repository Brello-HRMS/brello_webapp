import { useForm, Controller } from 'react-hook-form';

import { Button } from '../../../../components/common';
import { Select } from '../../../../components/common/Select/Select';
import { Input } from '../../../../components/ui/Input/Input';
import { DatePicker } from '../../../../components/ui/DatePicker/DatePicker';

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
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<OfferDetailsParams>({ defaultValues, mode: 'onSubmit' });

  return (
    <form onSubmit={handleSubmit(onNext)} className={styles.stepBody}>
      <div className={styles.grid2}>
        <div className={styles.field}>
          <Input
            label="Position / Role"
            required
            placeholder="Software Engineer"
            error={errors.position?.message}
            {...register('position', { required: 'Position is required' })}
          />
        </div>
        <div className={styles.field}>
          <Controller
            name="employment_type"
            control={control}
            rules={{ required: 'Employment type is required' }}
            render={({ field }) => (
              <Select
                label="Employment Type"
                required
                placeholder="Select..."
                options={EMPLOYMENT_TYPES}
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.employment_type?.message}
              />
            )}
          />
        </div>
      </div>

      <div className={styles.grid2}>
        <div className={styles.field}>
          <Controller
            name="joining_date"
            control={control}
            rules={{ required: 'Joining date is required' }}
            render={({ field }) => (
              <DatePicker
                label="Joining Date"
                required
                value={field.value}
                onChange={field.onChange}
                error={errors.joining_date?.message}
              />
            )}
          />
        </div>
        <div className={styles.field}>
          <Controller
            name="work_mode"
            control={control}
            rules={{ required: 'Work mode is required' }}
            render={({ field }) => (
              <Select
                label="Work Mode"
                required
                placeholder="Select..."
                options={WORK_MODES}
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.work_mode?.message}
              />
            )}
          />
        </div>
      </div>

      <div className={styles.grid2}>
        <div className={styles.field}>
          <Input
            label="Work Location"
            placeholder="Bengaluru, Karnataka"
            error={errors.work_location?.message}
            {...register('work_location')}
          />
        </div>
        <div className={styles.field}>
          <Input
            label="Probation Period (days)"
            type="number"
            min={0}
            placeholder="90"
            error={errors.probation_days?.message}
            {...register('probation_days', {
              valueAsNumber: true,
              min: { value: 0, message: 'Probation period cannot be negative' },
            })}
          />
        </div>
      </div>

      <div className={styles.grid2}>
        <div className={styles.field}>
          <Input
            label="Notice Period (days)"
            type="number"
            min={0}
            placeholder="30"
            error={errors.notice_period_days?.message}
            {...register('notice_period_days', {
              valueAsNumber: true,
              min: { value: 0, message: 'Notice period cannot be negative' },
            })}
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
