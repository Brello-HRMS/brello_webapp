import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Briefcase } from 'lucide-react';

import { Dialog, Button, Select, Checkbox } from '../../../../../components/common';
import { useEmployeesDropdown } from '../../../../../hooks/useEmployees';
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

const ASSET_OPTIONS: { label: string; value: string }[] = [
  { label: 'Laptop', value: 'LAPTOP' },
  { label: 'Access card', value: 'ACCESS_CARD' },
  { label: 'Mobile device', value: 'MOBILE' },
  { label: 'Office keys', value: 'KEYS' },
];

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
    trigger,
    formState: { errors },
  } = useForm<InitiateOffboardingDto>({
    resolver: zodResolver(initiateOffboardingSchema),
    defaultValues: {
      exit_type: undefined,
      last_working_day: '',
      reason: '',
      handover_to_user_id: undefined,
      assets_to_recover: [],
      schedule_exit_interview: false,
    },
  });

  useEffect(() => {
    if (effectiveImmediately) {
      const today = new Date().toISOString().split('T')[0];
      setValue('last_working_day', today);
    }
  }, [effectiveImmediately, setValue]);

  const { data: employeesResponse, isLoading: isEmployeesLoading } = useEmployeesDropdown();

  const handoverOptions = useMemo(
    () =>
      (employeesResponse?.data ?? [])
        .filter((e) => e.id !== employee.id)
        .map((e) => ({ label: e.name, value: e.id })),
    [employeesResponse, employee.id],
  );

  const onSubmit = (data: InitiateOffboardingDto) => {
    initiateOffboard(data, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const handleNext = async () => {
    if (step === 1) {
      const isValid = await trigger(['exit_type', 'last_working_day', 'reason']);
      if (!isValid) return;
      setStep(2);
    }
  };

  const handleFinalSubmit = handleSubmit(onSubmit, () => {
    // Send the user back to step 1 so they can see and fix the field errors.
    setStep(1);
  });

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
          onClick={handleFinalSubmit}
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
            <label>Handover to</label>
            <Controller
              name="handover_to_user_id"
              control={control}
              render={({ field }) => (
                <Select
                  options={handoverOptions}
                  value={field.value ?? ''}
                  onChange={(val) => field.onChange(val ? String(val) : undefined)}
                  placeholder={isEmployeesLoading ? 'Loading employees…' : 'Select employee'}
                />
              )}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Access to recover</label>
            <Controller
              name="assets_to_recover"
              control={control}
              render={({ field }) => {
                const selected = field.value ?? [];
                const toggle = (value: string, checked: boolean) => {
                  field.onChange(
                    checked ? [...selected, value] : selected.filter((v) => v !== value),
                  );
                };
                return (
                  <div className={styles.assetGrid}>
                    {ASSET_OPTIONS.map((opt) => (
                      <div key={opt.value} className={styles.assetCard}>
                        <Checkbox
                          label={opt.label}
                          checked={selected.includes(opt.value)}
                          onChange={(e) => toggle(opt.value, e.target.checked)}
                        />
                      </div>
                    ))}
                  </div>
                );
              }}
            />
          </div>

          <div style={{ marginTop: '32px' }}>
            <Controller
              name="schedule_exit_interview"
              control={control}
              render={({ field }) => (
                <Checkbox
                  label="Schedule exit interview"
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              )}
            />
          </div>
        </div>
      )}
    </Dialog>
  );
};
