import React, { useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import moment from 'moment';

import { Dialog, Button, Checkbox } from '../../../../components/common';
import { Select } from '../../../../components/ui/Select/Select';
import { DatePicker } from '../../../../components/ui/DatePicker/DatePicker';
import { TextArea } from '../../../../components/ui/TextArea/TextArea';
import { useCreateLeaveRequest } from '../../hooks/useLeaveRequest';
import { useMyLeaveBalance } from '../../../../hooks/useLeaveBalances';

import styles from './ApplyLeaveModal.module.scss';

import type { BalanceView } from '../../../../api/leaveBalances';

const schema = z
  .object({
    leave_type_id: z.string().min(1, 'Leave type is required'),
    from_date: z.string({ error: 'Start date is required' }).min(1, 'Start date is required'),
    to_date: z.string({ error: 'End date is required' }).min(1, 'End date is required'),
    reason: z.string().min(1, 'Reason is required'),
    is_half_day: z.boolean().optional(),
    half_day_session: z.enum(['MORNING', 'AFTERNOON']).optional(),
  })
  .refine(
    (data) => {
      if (data.is_half_day && !data.half_day_session) {
        return false;
      }
      return true;
    },
    {
      message: 'Half day session is required',
      path: ['half_day_session'],
    },
  );

type ApplyLeaveFormValues = z.infer<typeof schema>;

interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApplyLeaveModal: React.FC<ApplyLeaveModalProps> = ({ isOpen, onClose }) => {
  const { mutateAsync: createLeaveRequest, isPending } = useCreateLeaveRequest();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApplyLeaveFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      is_half_day: false,
    },
  });

  const isHalfDay = useWatch({ control, name: 'is_half_day' });
  const { data: balanceData } = useMyLeaveBalance();

  const leaveTypes = React.useMemo(() => {
    const balances = balanceData?.balances || [];
    return balances.map((b: BalanceView) => ({
      value: b.leave_type_id,
      label: `${b.leave_type_name} (${b.available_days} available)`,
    }));
  }, [balanceData]);

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: ApplyLeaveFormValues) => {
    try {
      await createLeaveRequest({
        ...data,
      });
      onClose();
    } catch {
      // Error is handled by mutation
    }
  };

  const fromDate = useWatch({ control, name: 'from_date' });
  const toDate = useWatch({ control, name: 'to_date' });

  const computedDays = React.useMemo(() => {
    if (!fromDate || !toDate) return 0;
    const start = moment(fromDate).startOf('day');
    const end = moment(toDate).startOf('day');
    if (end.isBefore(start)) return 0;

    let days = end.diff(start, 'days') + 1;
    if (isHalfDay) days -= 0.5;
    return Math.max(0, days);
  }, [fromDate, toDate, isHalfDay]);

  const dialogActions = (
    <>
      <Button variant="secondary" onClick={onClose} type="button" style={{ flex: 1 }}>
        Cancel
      </Button>
      <Button
        variant="primary"
        type="submit"
        form="apply-leave-form"
        isLoading={isPending}
        style={{ flex: 1 }}
      >
        Apply Leave
      </Button>
    </>
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="Apply Leave"
      position="right"
      actions={dialogActions}
    >
      <form id="apply-leave-form" onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <Controller
          name="leave_type_id"
          control={control}
          render={({ field }) => (
            <Select
              label="Leave Type"
              options={leaveTypes}
              value={field.value}
              onChange={field.onChange}
              error={errors.leave_type_id?.message}
            />
          )}
        />

        <div className={styles.row}>
          <Controller
            name="from_date"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="From Date"
                value={field.value}
                onChange={field.onChange}
                error={errors.from_date?.message}
              />
            )}
          />
          <Controller
            name="to_date"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="To Date"
                value={field.value}
                onChange={field.onChange}
                error={errors.to_date?.message}
              />
            )}
          />
        </div>

        <div className={styles.daysBadge}>Days: {computedDays}</div>

        <div className={styles.checkboxGroup}>
          <Controller
            name="is_half_day"
            control={control}
            render={({ field }) => (
              <Checkbox label="Half Day" checked={field.value} onChange={field.onChange} />
            )}
          />
        </div>

        {isHalfDay && (
          <Controller
            name="half_day_session"
            control={control}
            render={({ field }) => (
              <Select
                label="Session"
                options={[
                  { value: 'MORNING', label: 'Morning' },
                  { value: 'AFTERNOON', label: 'Afternoon' },
                ]}
                value={field.value}
                onChange={field.onChange}
                error={errors.half_day_session?.message}
              />
            )}
          />
        )}

        <Controller
          name="reason"
          control={control}
          render={({ field }) => (
            <TextArea
              label="Reason"
              value={field.value || ''}
              onChange={field.onChange}
              error={errors.reason?.message}
              rows={4}
            />
          )}
        />
      </form>
    </Dialog>
  );
};
