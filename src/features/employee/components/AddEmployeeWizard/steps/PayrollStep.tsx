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

const schema = z.object({
  taxRegime: z.string().min(1, 'Tax regime is required'),
  pan: z.string().min(1, 'PAN is required'),
  uan: z.string().optional(),
  accountNumber: z.string().min(1, 'Account number is required'),
  bankName: z.string().min(1, 'Bank name is required'),
  ifscCode: z.string().min(1, 'IFSC code is required'),
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
          placeholder="Enter code"
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
          placeholder="Enter Pan"
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
        placeholder="Enter UAN"
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
