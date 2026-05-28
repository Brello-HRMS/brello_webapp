import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';

import { Dialog, Button, ToggleButton } from '../../../components/common';
import { Input } from '../../../components/ui/Input/Input';
import { TextArea } from '../../../components/ui/TextArea/TextArea';
import { Status } from '../../../types/common';

import { useCreatePlatformDesignation, useUpdatePlatformDesignation } from './hooks';

import type { PlatformDesignation } from './types';

interface Props {
  open: boolean;
  onClose: () => void;
  designation?: PlatformDesignation | null;
}

type FormValues = {
  title: string;
  code: string;
  description: string;
  isActive: boolean;
};

export const DesignationFormModal: React.FC<Props> = ({ open, onClose, designation }) => {
  const isEdit = !!designation;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { title: '', code: '', description: '', isActive: true },
  });

  const { mutate: create, isPending: isCreating } = useCreatePlatformDesignation();
  const { mutate: update, isPending: isUpdating } = useUpdatePlatformDesignation();
  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      reset(
        designation
          ? {
              title: designation.title,
              code: designation.code,
              description: designation.description ?? '',
              isActive: designation.status === Status.ACTIVE,
            }
          : { title: '', code: '', description: '', isActive: true },
      );
    }
  }, [open, designation, reset]);

  const onSubmit = (values: FormValues) => {
    const payload = {
      title: values.title.trim(),
      code: values.code.trim().toUpperCase(),
      description: values.description.trim() || undefined,
      status: values.isActive ? Status.ACTIVE : Status.INACTIVE,
    };

    if (isEdit && designation) {
      update({ id: designation.id, data: payload }, { onSuccess: onClose });
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
        {isEdit ? 'Save changes' : 'Create designation'}
      </Button>
    </div>
  );

  return (
    <Dialog
      title={isEdit ? 'Edit Designation' : 'Add Default Designation'}
      open={open}
      onClose={onClose}
      actions={actions}
      maxWidth="500px"
      position="right"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <Input
          {...register('title', { required: 'Designation title is required' })}
          label="Designation Title"
          placeholder="e.g., Senior Engineer"
          required
          error={errors.title?.message}
        />
        <Input
          {...register('code', {
            required: 'Code is required',
            pattern: {
              value: /^[A-Z0-9_-]+$/,
              message: 'Code must be uppercase alphanumeric (A-Z, 0-9, -, _)',
            },
            setValueAs: (v: string) => v.toUpperCase(),
          })}
          label="Code"
          placeholder="e.g., SWE-SR"
          required
          error={errors.code?.message}
        />
        <TextArea
          {...register('description')}
          label="Description"
          placeholder="Optional description"
          rows={3}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>Status</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>
              Set initial visibility
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
