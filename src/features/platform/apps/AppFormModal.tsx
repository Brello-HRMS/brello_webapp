import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Dialog, Button } from '../../../components/common';
import { Input } from '../../../components/ui/Input/Input';
import { TextArea } from '../../../components/ui/TextArea/TextArea';

import { useCreateApp, useUpdateApp } from './hooks';

import type { PlatformApp } from './types';

interface Props {
  open: boolean;
  onClose: () => void;
  app?: PlatformApp | null;
}

type FormValues = {
  name: string;
  description: string;
  icon: string;
  priority: string;
};

export const AppFormModal: React.FC<Props> = ({ open, onClose, app }) => {
  const isEdit = !!app;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: '', description: '', icon: '', priority: '1' },
  });

  const { mutate: create, isPending: isCreating } = useCreateApp();
  const { mutate: update, isPending: isUpdating } = useUpdateApp();
  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      reset(
        app
          ? {
              name: app.name,
              description: app.description ?? '',
              icon: app.icon ?? '',
              priority: String(app.priority ?? 1),
            }
          : { name: '', description: '', icon: '', priority: '1' },
      );
    }
  }, [open, app, reset]);

  const onSubmit = (values: FormValues) => {
    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      icon: values.icon.trim() || undefined,
      priority: parseInt(values.priority) || 1,
    };

    if (isEdit && app) {
      update({ id: app.id, data: payload }, { onSuccess: onClose });
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
        {isEdit ? 'Save changes' : 'Create app'}
      </Button>
    </div>
  );

  return (
    <Dialog
      title={isEdit ? 'Edit App' : 'Create App'}
      open={open}
      onClose={onClose}
      actions={actions}
      maxWidth="480px"
      position="right"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <Input
          {...register('name', { required: 'App name is required' })}
          label="App Name"
          placeholder="e.g., HRMS"
          required
          error={errors.name?.message}
        />
        <TextArea
          {...register('description', { required: 'Description is required' })}
          label="Description"
          placeholder="Brief description of this app"
          rows={3}
          error={errors.description?.message}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input {...register('icon')} label="Icon" placeholder="e.g., LayoutDashboard" />
          <Input {...register('priority')} label="Priority" type="number" min="1" placeholder="1" />
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>
          Priority controls the default app on login — lower number = higher priority.
        </div>
      </form>
    </Dialog>
  );
};
