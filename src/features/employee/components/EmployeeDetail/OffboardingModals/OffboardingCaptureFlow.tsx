import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Briefcase } from 'lucide-react';

import { Dialog, Button, Select, Checkbox } from '../../../../../components/common';
import {
  initiateOffboardingSchema,
  type InitiateOffboardingDto,
  ExitType,
} from '../../../types/offboardingType';
import { useInitiateOffboarding } from '../../../hooks/useOffboarding';

import styles from './OffboardingCaptureFlow.module.scss';

import type { EmployeeDetail } from '../../../types/employeeType';

interface Props {
  employee: EmployeeDetail;
  isOpen: boolean;
  onClose: () => void;
  /** Whether the modal was opened with "Effective Immediately" pre-checked */
  effectiveImmediately: boolean;
}

const EXIT_REASON_OPTIONS = Object.entries(ExitType).map(([_key, value]) => ({
  label: value.charAt(0) + value.slice(1).toLowerCase(),
  value: value,
}));

export const OffboardingCaptureFlow: React.FC<Props> = ({
  employee,
  isOpen,
  onClose,
  effectiveImmediately,
}) => {
  const [step, setStep] = useState<1 | 2>(1);

  const { mutate: initiateOffboard, isPending } = useInitiateOffboarding(employee.id);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<InitiateOffboardingDto>({
    resolver: zodResolver(initiateOffboardingSchema),
    defaultValues: {
      exit_type: undefined,
      last_working_day: '',
      reason: '',
    },
  });

  useEffect(() => {
    if (effectiveImmediately) {
      const today = new Date().toISOString().split('T')[0];
      setValue('last_working_day', today);
    }
  }, [effectiveImmediately, setValue]);

  // Asset mock state for step 2
  const [assets, setAssets] = useState({
    laptop: false,
    accessCard: false,
    mobile: false,
    keys: false,
  });

  const onSubmit = (data: InitiateOffboardingDto) => {
    initiateOffboard(data, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
    }
  };

  const dialogFooter = (
    <div className={styles.btnGroup}>
      <Button
        variant="secondary"
        onClick={step === 1 ? onClose : () => setStep(1)}
        className={styles.btn}
      >
        {step === 1 ? 'Cancel' : 'Back'}
      </Button>
      {step === 1 ? (
        <Button variant="primary" onClick={handleNext} className={styles.btn}>
          Next
        </Button>
      ) : (
        <Button
          variant="primary"
          onClick={handleSubmit(onSubmit)}
          isLoading={isPending}
          className={styles.btn}
        >
          Initiate offboarding
        </Button>
      )}
    </div>
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={step === 1 ? 'Offboarding Details' : 'Handover & Assets'}
      position="right"
      actions={dialogFooter}
      maxWidth="480px"
    >
      {step === 1 && (
        <div>
          <div className={styles.sectionHeader}>EXIT DETAILS</div>

          <div className={styles.formGroup}>
            <label>
              Last Working Day<span className={styles.asterisk}>*</span>
            </label>
            <Controller
              name="last_working_day"
              control={control}
              render={({ field }) => (
                <input
                  type="date"
                  {...field}
                  className={`${styles.input} ${errors.last_working_day ? styles.hasError : ''}`}
                  disabled={effectiveImmediately}
                />
              )}
            />
            {errors.last_working_day && (
              <span className={styles.errorText}>{errors.last_working_day.message}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>
              Exit Reason<span className={styles.asterisk}>*</span>
            </label>
            <Controller
              name="exit_type"
              control={control}
              render={({ field }) => (
                <Select
                  options={EXIT_REASON_OPTIONS}
                  value={field.value}
                  onChange={(val) => field.onChange(val as ExitType)}
                  placeholder="Select a reason"
                  error={errors.exit_type?.message}
                />
              )}
            />
          </div>

          <div className={styles.formGroup}>
            <label>
              Notes<span className={styles.asterisk}>*</span>
            </label>
            <Controller
              name="reason"
              control={control}
              render={({ field }) => (
                <textarea
                  {...field}
                  placeholder="Add confidential exit notes here..."
                  className={`${styles.input} ${styles.textarea} ${errors.reason ? styles.hasError : ''}`}
                />
              )}
            />
            {errors.reason && <span className={styles.errorText}>{errors.reason.message}</span>}
          </div>

          <div className={styles.sectionHeader}>SALARY STRUCTURE</div>
          <div className={styles.salaryStructure}>
            <div className={styles.salaryRow}>
              <span className={styles.label}>Access Revocation Date</span>
              <span className={styles.value}>Same as last Working Day</span>
            </div>
            <div className={styles.salaryRow}>
              <span className={styles.label}>Payroll Status</span>
              <span className={styles.value}>Pending Final Settlement</span>
            </div>
            <div className={styles.salaryRow}>
              <span className={styles.label}>Reporting Manager</span>
              <span className={styles.value}>{employee.reportsTo || 'N/A'}</span>
            </div>
          </div>

          <div className={styles.lockdownCard}>
            <Lock className={styles.lockIcon} size={20} />
            <div className={styles.lockContent}>
              <h4>Data Lockdown Protocol</h4>
              <p>
                The following fields will be locked after offboarding is initiated:{' '}
                <strong>Department, Manager, Payroll fields.</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className={styles.lockdownCard} style={{ marginTop: 0, marginBottom: '24px' }}>
            <Briefcase className={styles.lockIcon} size={20} />
            <div className={styles.lockContent} style={{ width: '100%' }}>
              <h4 style={{ marginBottom: '16px' }}>Locked after offboarding initiated</h4>
              <div className={styles.lockedItemsList}>
                <div className={styles.lockedItem}>
                  <span className={styles.lockedItemLabel}>Department</span>
                  <span className={styles.lockedItemValue}>
                    {employee.profile?.department || 'N/A'} <Lock size={14} />
                  </span>
                </div>
                <div className={styles.lockedItem}>
                  <span className={styles.lockedItemLabel}>Manager</span>
                  <span className={styles.lockedItemValue}>
                    {employee.reportsTo || 'N/A'} <Lock size={14} />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>
              Handover to<span className={styles.asterisk}>*</span>
            </label>
            <Select
              options={[{ label: 'Akshay Verma', value: 'u-1' }]} // Dummy for visual completion
              value="u-1"
              onChange={() => {}}
              placeholder="Select employee"
            />
          </div>

          <div className={styles.formGroup}>
            <label>
              Access to recover<span className={styles.asterisk}>*</span>
            </label>
            <div className={styles.assetGrid}>
              <div className={styles.assetCard}>
                <Checkbox
                  label="Laptop"
                  checked={assets.laptop}
                  onChange={(e) => setAssets({ ...assets, laptop: e.target.checked })}
                />
              </div>
              <div className={styles.assetCard}>
                <Checkbox
                  label="Access card"
                  checked={assets.accessCard}
                  onChange={(e) => setAssets({ ...assets, accessCard: e.target.checked })}
                />
              </div>
              <div className={styles.assetCard}>
                <Checkbox
                  label="Mobile device"
                  checked={assets.mobile}
                  onChange={(e) => setAssets({ ...assets, mobile: e.target.checked })}
                />
              </div>
              <div className={styles.assetCard}>
                <Checkbox
                  label="Office keys"
                  checked={assets.keys}
                  onChange={(e) => setAssets({ ...assets, keys: e.target.checked })}
                />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '32px' }}>
            <Checkbox label="Schedule exit interview" checked={false} onChange={() => {}} />
          </div>
        </div>
      )}
    </Dialog>
  );
};
