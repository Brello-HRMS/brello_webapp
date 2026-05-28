import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Dialog, Button } from '../../../components/common';
import { Input } from '../../../components/ui/Input/Input';

import { useCreateAction, useUpdateAction } from './hooks';

import type { Action } from './types';

interface Props {
  open: boolean;
  onClose: () => void;
  action?: Action | null;
}

type FormValues = { name: string };

export const ActionFormModal: React.FC<Props> = ({ open, onClose, action }) => {
  const isEdit = !!action;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: { name: '' } });

  const { mutate: create, isPending: isCreating } = useCreateAction();
  const { mutate: update, isPending: isUpdating } = useUpdateAction();
  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (open) reset({ name: action?.name ?? '' });
  }, [open, action, reset]);

  const onSubmit = ({ name }: FormValues) => {
    const trimmed = name.trim();
    if (isEdit && action) {
      update({ id: action.id, data: { name: trimmed } }, { onSuccess: onClose });
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
      title={isEdit ? 'Edit Action' : 'Add Action'}
      open={open}
      onClose={onClose}
      actions={actions}
      maxWidth="420px"
      position="right"
    >
      <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '0.25rem 0' }}>
        <Input
          {...register('name', { required: 'Name is required' })}
          label="Action Name"
          placeholder="e.g., view, create, approve"
          required
          error={errors.name?.message}
          autoFocus
        />
      </form>
    </Dialog>
  );
};
