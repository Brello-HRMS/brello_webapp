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

const COMPONENT_TYPE_OPTIONS: SelectOption[] = [
  { value: 'earning', label: 'Earning' },
  { value: 'deduction', label: 'Deduction' },
  { value: 'bonus', label: 'Bonus' },
];

const CATEGORY_OPTIONS: SelectOption[] = [
  { value: 'fixed', label: 'Fixed' },
  { value: 'variable', label: 'Variable' },
  { value: 'statutory', label: 'Statutory' },
];

const CALCULATION_TYPE_OPTIONS: SelectOption[] = [
  { value: 'fixed', label: 'Fixed Amount' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'residual', label: 'Residual (CTC remainder)' },
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
  const isEditMode = !!initialData;
  const isDefault = initialData?.is_default ?? false;

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
      componentType: 'earning',
      category: 'fixed',
      calculationType: 'fixed',
      value: '',
      taxable: false,
      status: true,
    },
  });

  const calculationType = useWatch({ control, name: 'calculationType' });
  const isPercentage = calculationType === 'percentage';

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          componentType: initialData.component_type,
          category: initialData.category,
          calculationType: initialData.calculation_type,
          value:
            initialData.value !== undefined && initialData.value !== null
              ? String(initialData.value)
              : '',
          calculateFrom: initialData.calculate_from ?? '',
          taxable: initialData.is_taxable,
          status: initialData.is_active,
        });
      } else {
        reset({
          name: '',
          componentType: 'earning',
          category: 'fixed',
          calculationType: 'fixed',
          value: '',
          calculateFrom: '',
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

  // UUID-based: show CTC as a virtual option + all other components except self
  const baseComponentOptions: SelectOption[] = [
    { value: '', label: 'CTC (Cost to Company)' },
    ...availableComponents
      .filter((c) => c.id !== initialData?.id)
      .map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <Dialog
      title={isEditMode ? 'Edit Component' : 'Add Component'}
      open={isOpen}
      onClose={onClose}
      maxWidth="480px"
      actions={
        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose}>
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
        {isDefault && (
          <div className={styles.defaultBadge}>
            Default component — only value and status are editable
          </div>
        )}

        <Input
          label="Component Name*"
          placeholder="e.g. Medical Allowance"
          error={errors.name?.message}
          disabled={isDefault}
          {...register('name')}
        />

        <Controller
          name="componentType"
          control={control}
          render={({ field }) => (
            <Select
              label="Component Type"
              required
              options={COMPONENT_TYPE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.componentType?.message}
              disabled={isDefault}
            />
          )}
        />

        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Select
              label="Category"
              required
              options={CATEGORY_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.category?.message}
              disabled={isDefault}
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
              disabled={isDefault}
            />
          )}
        />

        {isPercentage && (
          <Controller
            name="calculateFrom"
            control={control}
            render={({ field }) => (
              <Select
                label="Percentage of*"
                required
                options={baseComponentOptions}
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.calculateFrom?.message}
                disabled={isDefault}
              />
            )}
          />
        )}

        <Input
          label={isPercentage ? 'Percentage (%)*' : 'Amount (₹)*'}
          type="number"
          placeholder="0"
          error={errors.value?.message}
          {...register('value')}
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
          <span className={styles.toggleLabel}>Active</span>
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
