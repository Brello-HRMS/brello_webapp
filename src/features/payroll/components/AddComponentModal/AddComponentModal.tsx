import React, { useEffect } from 'react';
import { useForm, Controller, useWatch, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { addComponentSchema } from '../../validation/payrollSchema';
import { Input } from '../../../../components/ui/Input/Input';
import { Select, type SelectOption } from '../../../../components/common/Select/Select';
import { ToggleButton } from '../../../../components/common/ToggleButton/ToggleButton';
import { Button } from '../../../../components/common/Button/Button';
import { Dialog } from '../../../../components/common/Dialog/Dialog';

import styles from './AddComponentModal.module.scss';

import type { AddComponentFormData, SalaryComponent } from '../../types/payrollConfigTypes';

const TYPE_OPTIONS: SelectOption[] = [
  { value: 'earning', label: 'Earning' },
  { value: 'deduction', label: 'Deduction' },
];

const CALCULATION_TYPE_OPTIONS: SelectOption[] = [
  { value: 'fixed', label: 'Fixed' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'residual', label: 'Residual' },
];

interface AddComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AddComponentFormData) => void;
  initialData?: SalaryComponent | null;
  availableComponents: SalaryComponent[];
}

export const AddComponentModal: React.FC<AddComponentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  availableComponents,
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AddComponentFormData>({
    resolver: zodResolver(addComponentSchema),
    defaultValues: {
      name: '',
      type: 'earning',
      calculationType: 'fixed',
      amount: '',
      taxable: false,
      status: true,
    },
  });

  const calculationType = useWatch({
    control,
    name: 'calculationType',
  });
  const isPercentage = calculationType === 'percentage';

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          type: initialData.type,
          calculationType: initialData.calculation_type,
          amount:
            initialData.calculation_value?.value !== undefined
              ? String(initialData.calculation_value.value)
              : '',
          parentComponentId: initialData.calculation_value?.base || '',
          taxable: initialData.is_taxable,
          status: initialData.is_active,
        });
      } else {
        reset({
          name: '',
          type: 'earning',
          calculationType: 'fixed',
          amount: '',
          parentComponentId: '',
          taxable: false,
          status: true,
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const onSubmit: SubmitHandler<AddComponentFormData> = (data) => {
    onSave(data);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  const componentOptions = [
    { value: 'CTC', label: 'CTC' },
    ...availableComponents
      .filter((c) => c.id !== initialData?.id)
      .map((c) => ({
        value: c.name,
        label: c.name,
      })),
  ];

  return (
    <Dialog
      title={initialData ? 'Edit Component' : 'Add Component'}
      open={isOpen}
      onClose={handleClose}
      maxWidth="480px"
      actions={
        <div className={styles.footer}>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit(onSubmit)}>
            Save
          </Button>
        </div>
      }
      position="right"
    >
      <div className={styles.formBody}>
        <Input
          label="Component Name*"
          placeholder="e.g. Medical Allowance"
          error={errors.name?.message}
          {...register('name')}
        />

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <Select
              label="Type"
              required
              options={TYPE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.type?.message}
            />
          )}
        />

        <Controller
          name="calculationType"
          control={control}
          render={({ field }) => (
            <Select
              label="Calculation Type"
              required
              options={CALCULATION_TYPE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.calculationType?.message}
            />
          )}
        />

        {isPercentage && (
          <Controller
            name="parentComponentId"
            control={control}
            render={({ field }) => (
              <Select
                label="Percentage of*"
                required
                options={componentOptions}
                value={field.value || 'CTC'}
                onChange={field.onChange}
                error={errors.parentComponentId?.message}
              />
            )}
          />
        )}

        <Input
          label={isPercentage ? 'Percentage (%)*' : 'Amount (₹)*'}
          type="number"
          placeholder="0"
          error={errors.amount?.message}
          {...register('amount')}
        />

        <div className={styles.toggleRow}>
          <span className={styles.toggleLabel}>Taxable</span>
          <Controller
            name="taxable"
            control={control}
            render={({ field }) => <ToggleButton checked={field.value} onChange={field.onChange} />}
          />
        </div>

        <div className={styles.toggleRow}>
          <span className={styles.toggleLabel}>Status</span>
          <Controller
            name="status"
            control={control}
            render={({ field }) => <ToggleButton checked={field.value} onChange={field.onChange} />}
          />
        </div>
      </div>
    </Dialog>
  );
};
