import { useForm } from 'react-hook-form';

import { Dialog, Button } from '../../../../components/common';
import { useCreateOfferCandidate } from '../../hooks/useOfferCandidates';

import styles from './AddCandidateModal.module.scss';

import type { CreateOfferCandidateParams } from '../../types/offerTypes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AddCandidateModal = ({ isOpen, onClose }: Props) => {
  const { mutate: createCandidate, isPending } = useCreateOfferCandidate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateOfferCandidateParams>();

  const onSubmit = (data: CreateOfferCandidateParams) => {
    createCandidate(data, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      title="Add Candidate"
      maxWidth="600px"
      position="right"
    >
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>First Name *</label>
            <input
              className={`${styles.input} ${errors.first_name ? styles.error : ''}`}
              {...register('first_name', { required: 'First name is required' })}
              placeholder="John"
            />
            {errors.first_name && (
              <span className={styles.errorMsg}>{errors.first_name.message}</span>
            )}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Last Name *</label>
            <input
              className={`${styles.input} ${errors.last_name ? styles.error : ''}`}
              {...register('last_name', { required: 'Last name is required' })}
              placeholder="Doe"
            />
            {errors.last_name && (
              <span className={styles.errorMsg}>{errors.last_name.message}</span>
            )}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Email *</label>
          <input
            className={`${styles.input} ${errors.email ? styles.error : ''}`}
            type="email"
            {...register('email', { required: 'Email is required' })}
            placeholder="john.doe@example.com"
          />
          {errors.email && <span className={styles.errorMsg}>{errors.email.message}</span>}
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Phone</label>
            <input className={styles.input} {...register('phone')} placeholder="+91 9876543210" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Applied For</label>
            <input
              className={styles.input}
              {...register('applied_for')}
              placeholder="Software Engineer"
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Current Company</label>
            <input
              className={styles.input}
              {...register('current_company')}
              placeholder="ACME Corp"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Experience (years)</label>
            <input
              className={styles.input}
              type="number"
              step="0.5"
              min={0}
              max={60}
              {...register('experience_years', { valueAsNumber: true })}
              placeholder="3"
            />
          </div>
        </div>

        <div className={styles.actions}>
          <Button variant="ghost" type="button" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isPending}>
            {isPending ? 'Adding...' : 'Add Candidate'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
