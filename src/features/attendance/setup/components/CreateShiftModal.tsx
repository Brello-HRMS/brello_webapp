import React, { useState } from 'react';
import { useForm, Controller, useWatch, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Dialog, Button, TimePicker, ToggleButton } from '../../../../components/common';
import { Input } from '../../../../components/ui/Input/Input';
import { useShifts } from '../hooks/useShifts';
import { shiftSchema } from '../validation/shiftSchema';
import { Status, type ApiError } from '../../../../types/common';

import styles from './CreateShiftModal.module.scss';

import type { ShiftFormInput, ShiftFormOutput } from '../validation/shiftSchema';
import type { IShift } from '../types/setupTypes';

interface CreateShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: IShift | null;
}

const getInitialForm = (data?: IShift | null): ShiftFormInput => ({
  name: data?.name ?? '',
  start_time: data?.start_time ?? '',
  end_time: data?.end_time ?? '',
  is_night_shift: data?.is_night_shift ?? false,
  late_grace_minutes: data?.late_grace_minutes ?? 15,
  auto_checkout_time: data?.auto_checkout_time ?? '',
  full_day_hours: data?.full_day_hours ?? 8,
  half_day_hours: data?.half_day_hours ?? 4,
});

const CreateShiftModal: React.FC<CreateShiftModalProps> = ({ isOpen, onClose, initialData }) => {
  const { createShift, isCreating, updateShift, isUpdating, changeShiftStatus, isChangingStatus } =
    useShifts();

  const isEditing = !!initialData;
  const isSaving = isCreating || isUpdating || isChangingStatus;

  const [localStatus, setLocalStatus] = useState<string>(initialData?.status ?? Status.ACTIVE);
  const [statusError, setStatusError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<ShiftFormInput, unknown, ShiftFormOutput>({
    resolver: zodResolver(shiftSchema),
    defaultValues: getInitialForm(initialData),
  });

  const isNightShift = useWatch({ control, name: 'is_night_shift' });

  const onSubmit: SubmitHandler<ShiftFormOutput> = async (data) => {
    // Status change must succeed before saving other fields
    if (isEditing && initialData && localStatus !== initialData.status) {
      try {
        await changeShiftStatus({ id: initialData.id, status: localStatus });
        setStatusError(null);
      } catch (err) {
        setStatusError((err as ApiError)?.response?.data?.message || 'Failed to update status');
        return;
      }
    }

    try {
      if (isEditing && initialData) {
        await updateShift({ id: initialData.id, data });
      } else {
        await createShift(data);
      }
      onClose();
    } catch (err) {
      const message = (err as ApiError)?.response?.data?.message || 'Error!';
      if (message === 'auto_checkout_time must be >= end_time') {
        setError('auto_checkout_time', {
          type: 'manual',
          message: 'Auto checkout time must be after or equal to end time',
        });
      }
    }
  };

  const actions = (
    <>
      <Button variant="secondary" onClick={onClose} style={{ flex: 1 }} disabled={isSaving}>
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit(onSubmit)}
        style={{ flex: 1 }}
        disabled={isSaving}
      >
        {isSaving ? 'Saving...' : isEditing ? 'Update' : 'Save'}
      </Button>
    </>
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Shift' : 'Create Shift'}
      position="right"
      maxWidth="480px"
      actions={actions}
    >
      <div className={styles.formSection}>
        <div className={styles.sectionTitle}>BASIC INFO</div>
        <div style={{ marginBottom: '16px' }}>
          <Input
            label="Shift Name"
            placeholder="e.g., General Shift"
            required
            error={errors.name?.message}
            {...register('name')}
          />
        </div>
        <div className={styles.toggleRow}>
          <span className={styles.toggleLabel}>Night Shift</span>
          <Controller
            name="is_night_shift"
            control={control}
            render={({ field }) => (
              <ToggleButton checked={field.value ?? false} onChange={field.onChange} />
            )}
          />
        </div>
        <div className={styles.row}>
          <Controller
            name="start_time"
            control={control}
            render={({ field }) => (
              <TimePicker
                label="Start Time"
                value={field.value}
                onChange={field.onChange}
                required
                error={errors.start_time?.message}
              />
            )}
          />
          <Controller
            name="end_time"
            control={control}
            render={({ field }) => (
              <TimePicker
                label={isNightShift ? 'End Time (next day)' : 'End Time'}
                value={field.value}
                onChange={field.onChange}
                required
                error={errors.end_time?.message}
              />
            )}
          />
        </div>
      </div>

      <div className={styles.formSection}>
        <div className={styles.sectionTitle}>CHECK-IN FLEXIBILITY</div>
        <div style={{ marginBottom: '16px' }}>
          <Input
            label="Late arrival grace period (mins)"
            type="number"
            required
            error={errors.late_grace_minutes?.message}
            {...register('late_grace_minutes', { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className={styles.formSection}>
        <div className={styles.sectionTitle}>CHECK-OUT SETTINGS</div>
        <div style={{ marginBottom: '16px' }}>
          <Controller
            name="auto_checkout_time"
            control={control}
            render={({ field }) => (
              <TimePicker
                label={isNightShift ? 'Auto Checkout Time (next day)' : 'Auto Checkout Time'}
                value={field.value ?? ''}
                onChange={field.onChange}
                required
                error={errors.auto_checkout_time?.message}
              />
            )}
          />
        </div>
      </div>

      <div className={styles.formSection}>
        <div className={styles.sectionTitle}>WORKING HOURS</div>
        <div className={styles.row}>
          <Input
            label="Full Day Hours"
            type="number"
            required
            error={errors.full_day_hours?.message}
            {...register('full_day_hours', { valueAsNumber: true })}
          />
          <Input
            label="Half Day Hours"
            type="number"
            required
            error={errors.half_day_hours?.message}
            {...register('half_day_hours', { valueAsNumber: true })}
          />
        </div>
      </div>

      {isEditing && (
        <div className={styles.formSection}>
          <div className={styles.sectionTitle}>STATUS</div>
          <div className={styles.toggleRow}>
            <div>
              <span className={styles.toggleLabel}>
                {localStatus === Status.ACTIVE ? 'Active' : 'Inactive'}
              </span>
              {statusError && (
                <p style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '4px' }}>
                  {statusError}
                </p>
              )}
            </div>
            <ToggleButton
              checked={localStatus === Status.ACTIVE}
              onChange={(v) => {
                setLocalStatus(v ? Status.ACTIVE : Status.INACTIVE);
                setStatusError(null);
              }}
            />
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default CreateShiftModal;
