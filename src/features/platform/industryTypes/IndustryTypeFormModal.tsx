import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Dialog, Button } from '../../../components/common';
import { Input } from '../../../components/ui/Input/Input';

import { useCreateIndustryType, useUpdateIndustryType } from './hooks';

import type { IndustryType } from './types';

interface Props {
  open: boolean;
  onClose: () => void;
  industryType?: IndustryType | null;
}

type FormValues = { name: string };

export const IndustryTypeFormModal: React.FC<Props> = ({ open, onClose, industryType }) => {
  const isEdit = !!industryType;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { name: '' } });

  const { mutate: create, isPending: isCreating } = useCreateIndustryType();
  const { mutate: update, isPending: isUpdating } = useUpdateIndustryType();
  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (open) reset({ name: industryType?.name ?? '' });
  }, [open, industryType, reset]);

  const onSubmit = ({ name }: FormValues) => {
    const trimmed = name.trim();
    if (isEdit && industryType) {
      update({ id: industryType.id, data: { name: trimmed } }, { onSuccess: onClose });
    } else {
      create({ name: trimmed }, { onSuccess: onClose });
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
        {isEdit ? 'Save changes' : 'Create'}
      </Button>
    </div>
  );

  return (
    <Dialog
      title={isEdit ? 'Edit Industry Type' : 'Add Industry Type'}
      open={open}
      onClose={onClose}
      actions={actions}
      maxWidth="420px"
      position="right"
    >
      <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '0.25rem 0' }}>
        <Input
          {...register('name', { required: 'Name is required' })}
          label="Name"
          placeholder="e.g., Technology"
          required
          error={errors.name?.message}
          autoFocus
        />
      </form>
    </Dialog>
  );
};
