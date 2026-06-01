import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Globe } from 'lucide-react';

import { Dialog, Button } from '../../../components/common';
import { Input } from '../../../components/ui/Input/Input';

import { useCreateEnterprise, useUpdateEnterprise } from './hooks';

import type { Enterprise } from './types';

interface Props {
  open: boolean;
  onClose: () => void;
  enterprise?: Enterprise | null;
}

type FormValues = {
  name: string;
  domain: string;
  logo: string;
  favicon: string;
};

export const EnterpriseFormModal: React.FC<Props> = ({ open, onClose, enterprise }) => {
  const isEdit = !!enterprise;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: '', domain: '', logo: '', favicon: '' },
  });

  const { mutate: create, isPending: isCreating } = useCreateEnterprise();
  const { mutate: update, isPending: isUpdating } = useUpdateEnterprise();
  const isPending = isCreating || isUpdating;

  useEffect(() => {
    if (open) {
      reset(
        enterprise
          ? {
              name: enterprise.name,
              domain: enterprise.domain,
              logo: enterprise.logo ?? '',
              favicon: enterprise.favicon ?? '',
            }
          : { name: '', domain: '', logo: '', favicon: '' },
      );
    }
  }, [open, enterprise, reset]);

  const onSubmit = (values: FormValues) => {
    const payload = {
      name: values.name.trim(),
      domain: values.domain.trim().toLowerCase(),
      logo: values.logo.trim() || undefined,
      favicon: values.favicon.trim() || undefined,
    };

    if (isEdit && enterprise) {
      update({ id: enterprise.id, data: payload }, { onSuccess: onClose });
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
        {isEdit ? 'Save changes' : 'Create enterprise'}
      </Button>
    </div>
  );

  return (
    <Dialog
      title={isEdit ? 'Edit Enterprise' : 'Add Enterprise'}
      open={open}
      onClose={onClose}
      actions={actions}
      maxWidth="500px"
      position="right"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
      >
        <Input
          {...register('name', {
            required: 'Enterprise name is required',
            minLength: { value: 2, message: 'Name must be at least 2 characters' },
          })}
          label="Enterprise Name"
          placeholder="e.g., Acme Corporation"
          required
          error={errors.name?.message}
        />

        <div>
          <Input
            {...register('domain', {
              required: 'Domain is required',
              pattern: {
                value: /^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,63}$/,
                message: 'Must be a valid domain (e.g. example.com)',
              },
            })}
            label="Domain"
            placeholder="example.com"
            required
            error={errors.domain?.message}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              marginTop: '0.375rem',
              fontSize: '0.75rem',
              color: 'var(--color-gray-400)',
            }}
          >
            <Globe size={12} />
            Domain must be a registered domain — DNS validation is performed on save.
          </div>
        </div>

        <Input
          {...register('logo')}
          label="Logo URL"
          placeholder="https://example.com/logo.png"
          error={errors.logo?.message}
        />

        <Input
          {...register('favicon')}
          label="Favicon URL"
          placeholder="https://example.com/favicon.ico"
          error={errors.favicon?.message}
        />
      </form>
    </Dialog>
  );
};
