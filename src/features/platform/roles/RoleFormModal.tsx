import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';

import { Dialog, Button, ToggleButton } from '../../../components/common';
import { MultiSelect } from '../../../components/common/MultiSelect/MultiSelect';
import { Input } from '../../../components/ui/Input/Input';
import { TextArea } from '../../../components/ui/TextArea/TextArea';
import { useAppsList } from '../apps/hooks';

import { useCreatePlatformRole, useUpdatePlatformRole } from './hooks';

import type { MultiSelectOption } from '../../../components/common/MultiSelect/MultiSelect';
import type { PlatformRole } from './types';

interface Props {
  open: boolean;
  onClose: () => void;
  role?: PlatformRole | null;
}

type FormValues = {
  name: string;
  app_ids: string[];
  description: string;
  code: string;
  is_default: boolean;
};

export const RoleFormModal: React.FC<Props> = ({ open, onClose, role }) => {
  const isEdit = !!role;
  const { data: appsResp } = useAppsList();
  const apps = appsResp?.data ?? [];

  const { mutate: create, isPending: isCreating } = useCreatePlatformRole();
  const { mutate: update, isPending: isUpdating } = useUpdatePlatformRole();
  const isPending = isCreating || isUpdating;

  const appOptions: MultiSelectOption[] = apps.map((app) => ({ value: app.id, label: app.name }));

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: '', app_ids: [], description: '', code: '', is_default: true },
  });

  useEffect(() => {
    if (open) {
      if (role) {
        const existingAppIds = role.roleApps?.map((ra) => ra.app_id) ?? [role.app_id];
        reset({
          name: role.name,
          app_ids: existingAppIds,
          description: role.description ?? '',
          code: role.code ?? '',
          is_default: role.is_default,
        });
      } else {
        reset({ name: '', app_ids: [], description: '', code: '', is_default: true });
      }
    }
  }, [open, role, reset]);

  const onSubmit = (values: FormValues) => {
    const primaryAppId = values.app_ids[0] ?? '';
    const payload = {
      name: values.name.trim(),
      app_id: primaryAppId,
      app_ids: values.app_ids,
      description: values.description.trim() || undefined,
      code: values.code.trim() || undefined,
      is_system_defined: values.is_default,
    };
    if (isEdit && role) {
      update(
        { id: role.id, data: { ...payload, app_ids: values.app_ids } },
        { onSuccess: onClose },
      );
    } else {
      create(payload, { onSuccess: onClose });
    }
  };

  const actions = (
    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
      <Button variant="secondary" onClick={onClose} type="button" disabled={isPending}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSubmit(onSubmit)} isLoading={isPending}>
        {isEdit ? 'Save changes' : 'Create role'}
      </Button>
    </div>
  );

  return (
    <Dialog
      title={isEdit ? 'Edit Role' : 'Create Platform Role'}
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
        <Controller
          name="app_ids"
          control={control}
          rules={{ validate: (v) => v.length > 0 || 'At least one app is required' }}
          render={({ field }) => (
            <MultiSelect
              label="Apps"
              required
              options={appOptions}
              value={field.value}
              onChange={(val) => field.onChange(val.map(String))}
              placeholder="Select apps…"
              error={errors.app_ids?.message}
            />
          )}
        />

        <Input
          {...register('name', { required: 'Role name is required' })}
          label="Role Name"
          placeholder="e.g., HR Manager"
          required
          error={errors.name?.message}
        />

        <Input {...register('code')} label="Code" placeholder="e.g., HR_MANAGER" />

        <TextArea
          {...register('description')}
          label="Description"
          placeholder="Optional description"
          rows={2}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>Auto-assign to new orgs</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>
              Role is cloned when a new organisation is created
            </div>
          </div>
          <Controller
            name="is_default"
            control={control}
            render={({ field }) => (
              <ToggleButton checked={field.value} onChange={field.onChange} label="Default" />
            )}
          />
        </div>
      </form>
    </Dialog>
  );
};
