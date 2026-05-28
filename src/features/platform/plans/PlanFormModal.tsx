import React, { useEffect } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { Plus, X } from 'lucide-react';

import { Dialog, Button, ToggleButton } from '../../../components/common';
import { Input } from '../../../components/ui/Input/Input';
import { TextArea } from '../../../components/ui/TextArea/TextArea';
import { Select } from '../../../components/ui/Select/Select';
import { Status } from '../../../types/common';

import { useCreatePlan, useUpdatePlan } from './hooks';
import { BillingCycle } from './types';

import type { Plan } from './types';

interface Props {
  open: boolean;
  onClose: () => void;
  plan?: Plan | null;
}

type FormValues = {
  name: string;
  price: string;
  price_per_employee_annual: string;
  annual_discount_percent: string;
  tier_rank: string;
  billing_cycle_default: BillingCycle;
  description: string;
  discount: string;
  isActive: boolean;
  feature: string[];
  featureInput: string;
};

const BILLING_CYCLE_OPTIONS = [
  { value: BillingCycle.MONTHLY, label: 'Monthly' },
  { value: BillingCycle.ANNUAL, label: 'Annual' },
];

export const PlanFormModal: React.FC<Props> = ({ open, onClose, plan }) => {
  const isEdit = !!plan;

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      price: '',
      price_per_employee_annual: '',
      annual_discount_percent: '',
      tier_rank: '0',
      billing_cycle_default: BillingCycle.MONTHLY,
      description: '',
      discount: '',
      isActive: true,
      feature: [],
      featureInput: '',
    },
  });

  const features = useWatch({ control, name: 'feature' });
  const featureInput = useWatch({ control, name: 'featureInput' });

  const { mutate: create, isPending: isCreating } = useCreatePlan();
  const { mutate: update, isPending: isUpdating } = useUpdatePlan();
  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      if (plan) {
        reset({
          name: plan.name,
          price: String(plan.price),
          price_per_employee_annual: String(plan.price_per_employee_annual),
          annual_discount_percent: String(plan.annual_discount_percent),
          tier_rank: String(plan.tier_rank),
          billing_cycle_default: plan.billing_cycle_default,
          description: plan.description ?? '',
          discount: String(plan.discount),
          isActive: plan.status === Status.ACTIVE,
          feature: plan.feature ?? [],
          featureInput: '',
        });
      } else {
        reset({
          name: '',
          price: '',
          price_per_employee_annual: '',
          annual_discount_percent: '',
          tier_rank: '0',
          billing_cycle_default: BillingCycle.MONTHLY,
          description: '',
          discount: '',
          isActive: true,
          feature: [],
          featureInput: '',
        });
      }
    }
  }, [open, plan, reset]);

  const addFeature = () => {
    const trimmed = featureInput.trim();
    if (trimmed && !features.includes(trimmed)) {
      setValue('feature', [...features, trimmed]);
      setValue('featureInput', '');
    }
  };

  const removeFeature = (index: number) => {
    setValue(
      'feature',
      features.filter((_, i) => i !== index),
    );
  };

  const handleFeatureKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFeature();
    }
  };

  const onSubmit = (values: FormValues) => {
    const payload = {
      name: values.name.trim(),
      price: parseFloat(values.price) || 0,
      price_per_employee_annual: parseFloat(values.price_per_employee_annual) || 0,
      annual_discount_percent: parseFloat(values.annual_discount_percent) || 0,
      tier_rank: parseInt(values.tier_rank) || 0,
      billing_cycle_default: values.billing_cycle_default,
      description: values.description.trim() || undefined,
      discount: parseFloat(values.discount) || 0,
      feature: features,
      status: values.isActive ? Status.ACTIVE : Status.INACTIVE,
    };

    if (isEdit && plan) {
      update({ id: plan.id, data: payload }, { onSuccess: onClose });
    } else {
      create(payload, { onSuccess: onClose });
    }
  };

  const actions = (
    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
      <Button variant="secondary" onClick={onClose} type="button" disabled={isPending}>
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit(onSubmit)}
        type="submit"
        isLoading={isPending}
      >
        {isEdit ? 'Save changes' : 'Create plan'}
      </Button>
    </div>
  );

  return (
    <Dialog
      title={isEdit ? 'Edit Plan' : 'Create Plan'}
      open={open}
      onClose={onClose}
      actions={actions}
      maxWidth="540px"
      position="right"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <Input
          {...register('name', { required: 'Plan name is required' })}
          label="Plan Name"
          placeholder="e.g., Professional"
          required
          error={errors.name?.message}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            {...register('price', { required: 'Price is required' })}
            label="Monthly Price (₹ / employee)"
            placeholder="0.00"
            type="number"
            min="0"
            step="0.01"
            required
            error={errors.price?.message}
          />
          <Input
            {...register('price_per_employee_annual')}
            label="Annual Price (₹ / employee)"
            placeholder="0.00"
            type="number"
            min="0"
            step="0.01"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            {...register('discount')}
            label="Discount (%)"
            placeholder="0"
            type="number"
            min="0"
            max="100"
            step="0.01"
          />
          <Input
            {...register('annual_discount_percent')}
            label="Annual Discount (%)"
            placeholder="0"
            type="number"
            min="0"
            max="100"
            step="0.01"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            {...register('tier_rank')}
            label="Tier Rank"
            placeholder="0 = Free, 1 = Standard, 2 = Premium"
            type="number"
            min="0"
          />
          <Controller
            name="billing_cycle_default"
            control={control}
            render={({ field }) => (
              <Select
                label="Default Billing Cycle"
                id="billing_cycle_default"
                options={BILLING_CYCLE_OPTIONS}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </div>

        <TextArea
          {...register('description')}
          label="Description"
          placeholder="Optional plan description"
          rows={3}
        />

        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>
            Features
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              value={featureInput}
              onChange={(e) => setValue('featureInput', e.target.value)}
              onKeyDown={handleFeatureKeyDown}
              placeholder="Add a feature and press Enter"
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                fontSize: '0.875rem',
                outline: 'none',
                background: 'var(--color-bg-input, #fff)',
                color: 'var(--color-text)',
              }}
            />
            <Button variant="secondary" type="button" onClick={addFeature}>
              <Plus size={16} />
            </Button>
          </div>
          {features.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {features.map((feature, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.375rem 0.75rem',
                    background: 'var(--color-bg-subtle, #f9fafb)',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <span>{feature}</span>
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.125rem',
                      color: 'var(--color-gray-400)',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>Status</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>
              Visible to customers when active
            </div>
          </div>
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <ToggleButton checked={field.value} onChange={field.onChange} label="Active" />
            )}
          />
        </div>
      </form>
    </Dialog>
  );
};
