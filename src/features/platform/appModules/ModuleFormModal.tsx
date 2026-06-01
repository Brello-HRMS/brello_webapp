import React, { useEffect } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';

import { Dialog, Button, Select } from '../../../components/common';
import { Input } from '../../../components/ui/Input/Input';

import { useCreateModule, useUpdateModule } from './hooks';
import { ModuleType } from './types';

import type { AppModule } from './types';

interface Props {
  open: boolean;
  onClose: () => void;
  appId: string;
  /** All modules of the app — used for WBS computation and uniqueness validation */
  allModules: AppModule[];
  /** Only root (MOD-type) modules — used for parent_id select options */
  rootModules: AppModule[];
  /** Pre-fill parent when clicking "Add sub-module" on a row */
  defaultParentId?: string | null;
  module?: AppModule | null;
}

type FormValues = {
  name: string;
  code: string;
  wbs_code: string;
  parent_id: string;
  icon: string;
  path: string;
};

/** Returns the next available WBS code for a given parent (or root if no parent). */
const computeNextWbs = (allModules: AppModule[], parentId?: string): string => {
  if (!parentId) {
    const used = allModules.filter((m) => !m.parent_id).map((m) => parseInt(m.wbs_code) || 0);
    return String(Math.max(0, ...used) + 1);
  }
  const parent = allModules.find((m) => m.id === parentId);
  if (!parent) return '';
  const used = allModules
    .filter((m) => m.parent_id === parentId)
    .map((m) => parseInt(m.wbs_code.split('.').at(-1) ?? '0') || 0);
  return `${parent.wbs_code}.${Math.max(0, ...used) + 1}`;
};

export const ModuleFormModal: React.FC<Props> = ({
  open,
  onClose,
  appId,
  allModules,
  rootModules,
  defaultParentId,
  module,
}) => {
  const isEdit = !!module;

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { name: '', code: '', wbs_code: '', parent_id: '', icon: '', path: '' },
  });

  const { mutate: create, isPending: isCreating } = useCreateModule(appId);
  const { mutate: update, isPending: isUpdating } = useUpdateModule(appId);
  const isPending = isCreating || isUpdating;

  const selectedParentId = useWatch({ control, name: 'parent_id' });
  const isSubModule = !!selectedParentId;

  useEffect(() => {
    if (open) {
      reset(
        module
          ? {
              name: module.name,
              code: module.code,
              wbs_code: module.wbs_code,
              parent_id: module.parent_id ?? '',
              icon: module.icon ?? '',
              path: module.path ?? '',
            }
          : {
              name: '',
              code: '',
              wbs_code: computeNextWbs(allModules, defaultParentId ?? undefined),
              parent_id: defaultParentId ?? '',
              icon: '',
              path: '',
            },
      );
    }
  }, [open, module, defaultParentId, allModules, reset]);

  const onSubmit = (values: FormValues) => {
    const parentId = values.parent_id || undefined;
    const payload = {
      name: values.name.trim(),
      code: values.code.trim().toUpperCase(),
      app_id: appId,
      wbs_code: values.wbs_code.trim(),
      parent_id: parentId,
      type: parentId ? ModuleType.SUBMOD : ModuleType.MOD,
      icon: values.icon.trim() || undefined,
      path: values.path.trim() || undefined,
    };

    if (isEdit && module) {
      const { app_id: _, parent_id: __, ...updatePayload } = payload;
      update({ id: module.id, data: updatePayload }, { onSuccess: onClose });
    } else {
      create(payload, { onSuccess: onClose });
    }
  };

  const parentOptions = [
    { value: '', label: '— None (top-level module) —' },
    ...rootModules.map((m) => ({ value: m.id, label: `${m.wbs_code} — ${m.name}` })),
  ];

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
        {isEdit ? 'Save changes' : isSubModule ? 'Create sub-module' : 'Create module'}
      </Button>
    </div>
  );

  const title = isEdit ? `Edit — ${module?.name}` : isSubModule ? 'Add Sub-Module' : 'Add Module';

  return (
    <Dialog
      title={title}
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
          {...register('name', { required: 'Module name is required' })}
          label="Module Name"
          placeholder="e.g., Leave Management"
          required
          error={errors.name?.message}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input
            {...register('code', {
              required: 'Code is required',
              setValueAs: (v: string) => v.toUpperCase(),
            })}
            label="Code"
            placeholder="e.g., LEAVE_MGMT"
            required
            error={errors.code?.message}
          />
          <Input
            {...register('wbs_code', {
              required: 'WBS code is required',
              validate: (val) => {
                const trimmed = val.trim();
                const conflict = allModules.find(
                  (m) => m.wbs_code === trimmed && m.id !== module?.id,
                );
                return !conflict || `WBS code "${trimmed}" is already used by "${conflict.name}"`;
              },
            })}
            label="WBS Code"
            placeholder="e.g., 1 or 1.2"
            required
            error={errors.wbs_code?.message}
          />
        </div>

        {!isEdit && (
          <Controller
            name="parent_id"
            control={control}
            render={({ field }) => (
              <Select
                label="Parent Module"
                options={parentOptions}
                value={field.value}
                onChange={(val) => {
                  const strVal = String(val);
                  field.onChange(strVal);
                  setValue('wbs_code', computeNextWbs(allModules, strVal || undefined));
                }}
              />
            )}
          />
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Input {...register('icon')} label="Icon" placeholder="e.g., CalendarDays" />
          <Input {...register('path')} label="Path" placeholder="e.g., /attendance/balance" />
        </div>

        <div
          style={{
            padding: '0.5rem 0.75rem',
            background: 'var(--color-bg-subtle, #f9fafb)',
            borderRadius: '6px',
            fontSize: '0.75rem',
            color: 'var(--color-gray-500)',
            border: '1px solid var(--color-border)',
          }}
        >
          <strong>Type:</strong>{' '}
          {isSubModule ? 'Sub-module (child of selected parent)' : 'Module (top-level)'}
          {' · '}
          <strong>WBS:</strong> auto-assigned, editable if needed
        </div>
      </form>
    </Dialog>
  );
};
