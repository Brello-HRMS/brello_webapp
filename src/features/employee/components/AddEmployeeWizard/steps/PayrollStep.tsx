/* eslint-disable react-hooks/incompatible-library */
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Input } from '../../../../../components/ui/Input/Input';
import { Button, Select } from '../../../../../components/common';
import { useWizard } from '../WizardContext';
import { useEmployeeWizard } from '../../../hooks/useEmployeeWizard';

import styles from './PayrollStep.module.scss';

const ACCOUNT_NUMBER_REGEX = /^\d{9,18}$/;
const BANK_NAME_REGEX = /^[A-Za-z][A-Za-z .&'-]*$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const UAN_REGEX = /^\d{12}$/;

const schema = z.object({
  taxRegime: z.string().min(1, 'Tax regime is required'),
  pan: z.string().min(1, 'PAN is required').regex(PAN_REGEX, 'Enter a valid PAN (e.g. ABCDE1234F)'),
  uan: z
    .string()
    .optional()
    .refine((val) => !val || UAN_REGEX.test(val), 'UAN must be 12 digits'),
  accountNumber: z
    .string()
    .min(1, 'Account number is required')
    .regex(ACCOUNT_NUMBER_REGEX, 'Account number must be 9-18 digits'),
  bankName: z
    .string()
    .min(1, 'Bank name is required')
    .regex(BANK_NAME_REGEX, 'Enter a valid bank name'),
  ifscCode: z
    .string()
    .min(1, 'IFSC code is required')
    .regex(IFSC_REGEX, 'Enter a valid IFSC code (e.g. ABCD0123456)'),
});

type FormData = z.infer<typeof schema>;

interface PayrollStepProps {
  onClose: () => void;
}

export const PayrollStep: React.FC<PayrollStepProps> = ({ onClose }) => {
  const { employeeId, formData, updateFormData, nextStep, isEditMode } = useWizard();
  const { payrollMutation } = useEmployeeWizard();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      taxRegime: formData.taxRegime || 'NEW',
      pan: formData.pan || '',
      uan: formData.uan || '',
      accountNumber: formData.accountNumber || '',
      bankName: formData.bankName || '',
      ifscCode: formData.ifscCode || '',
    },
  });

  // Auto-save to context on change via subscription
  React.useEffect(() => {
    const subscription = watch((value) => {
      updateFormData(value);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateFormData]);

  // Auto-save to context on change via subscription

  const onSubmit = (data: FormData) => {
    updateFormData(data);

    if (!employeeId) return;

    payrollMutation.mutate(
      {
        id: employeeId,
        data: {
          taxRegime: data.taxRegime,
          gov_info: {
            pan: data.pan,
            uan: data.uan,
          },
          bank_info: {
            accountNumber: data.accountNumber,
            bankName: data.bankName,
            ifscCode: data.ifscCode,
          },
        },
      },
      {
        onSuccess: () => {
          nextStep();
        },
      },
    );
  };

  const handleSaveDraft = () => {
    // Already saved via auto-sync, just close
    onClose();
  };

  const isPending = payrollMutation.isPending;

  const taxRegimeOptions = [
    { label: 'Old Regime', value: 'OLD' },
    { label: 'New Regime', value: 'NEW' },
  ];

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.sectionTitle}>BANK DETAILS</div>

      <Input
        label="A/c Number"
        required
        placeholder="Enter full account number"
        {...register('accountNumber')}
        error={errors.accountNumber?.message}
      />

      <div className={styles.row}>
        <Input
          label="Bank Name"
          required
          placeholder="Enter bank name"
          {...register('bankName')}
          error={errors.bankName?.message}
        />
        <Input
          label="IFSC Code"
          required
          placeholder="e.g. ABCD0123456"
          {...register('ifscCode')}
          error={errors.ifscCode?.message}
        />
      </div>

      <div className={styles.sectionDivider} />

      <div className={styles.sectionTitle}>TAX & PF INFO</div>

      <div className={styles.row}>
        <Input
          label="Pan Number"
          required
          placeholder="e.g. ABCDE1234F"
          {...register('pan')}
          error={errors.pan?.message}
        />
        <Controller
          name="taxRegime"
          control={control}
          render={({ field }) => (
            <Select
              label="Tax Regime"
              required
              options={taxRegimeOptions}
              value={field.value}
              onChange={field.onChange}
              error={errors.taxRegime?.message}
            />
          )}
        />
      </div>

      <Input
        label="UAN Number (Only if Yes)"
        placeholder="12-digit UAN"
        {...register('uan')}
        error={errors.uan?.message}
      />

      <div className={styles.actions}>
        <Button
          variant="secondary"
          type="button"
          onClick={isEditMode ? onClose : handleSaveDraft}
          className={styles.saveDraftButton}
          isLoading={isPending}
        >
          {isEditMode ? 'Cancel' : 'Save draft'}
        </Button>
        <Button variant="primary" type="submit" className={styles.nextButton} isLoading={isPending}>
          Next
        </Button>
      </div>
    </form>
  );
};
