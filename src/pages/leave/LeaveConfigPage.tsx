import React, { useEffect } from 'react';
import { useForm, FormProvider, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';

import { PageHeader } from '../../components/common/PageHeader/PageHeader';
import { LeaveRulesCard } from '../../features/leave/components/LeaveRulesCard';
import { LeaveTypesCard } from '../../features/leave/components/LeaveTypesCard';
import { Button } from '../../components/ui/Button/Button';
import {
  leaveConfigSchema,
  type LeaveConfigFormValues,
} from '../../features/leave/schemas/leaveConfig.schema';
import {
  useLeaveConfigQuery,
  useSaveLeaveConfigMutation,
} from '../../features/leave/hooks/useLeaveConfig';

interface RawLeaveType {
  id?: string;
  name: string;
  days: number;
  accrual: 'none' | 'monthly' | 'yearly';
  allow_half_day?: boolean;
}

const defaultValues: LeaveConfigFormValues = {
  totalLeave: 24,
  rules: {
    approvalRequired: true,
    maxPerMonth: 3,
    allowHalfDay: true,
    allowBackdated: true,
    maxBackdatedDays: 5,
    sandwichRule: false,
  },
  leaveTypes: [],
};

const LeaveConfigPage: React.FC = () => {
  const { data: config, isLoading } = useLeaveConfigQuery();
  const { mutateAsync: saveConfig, isPending: isSaving } = useSaveLeaveConfigMutation();

  const configId = config?.id ?? null;

  const methods = useForm<LeaveConfigFormValues>({
    resolver: zodResolver(leaveConfigSchema),
    defaultValues,
    mode: 'onChange',
  });

  useEffect(() => {
    if (config) {
      methods.reset({
        totalLeave: config.total_leave || 24,
        rules: {
          approvalRequired: config.rules?.approval_required ?? true,
          maxPerMonth: config.rules?.max_per_month,
          allowHalfDay: config.rules?.allow_half_day ?? true,
          allowBackdated: config.rules?.allow_backdated ?? false,
          maxBackdatedDays: config.rules?.max_backdated_days,
          sandwichRule: config.rules?.sandwich_rule ?? false,
        },
        leaveTypes:
          config.leave_types?.map((lt: RawLeaveType) => ({
            id: lt.id,
            name: lt.name,
            days: lt.days,
            accrual: lt.accrual,
            allowHalfDay: lt.allow_half_day ?? false,
          })) || [],
      });
    }
  }, [config, methods]);

  const onSubmit = async (data: LeaveConfigFormValues) => {
    await saveConfig({ configId, data });
  };

  const onInvalid = (errors: FieldErrors<LeaveConfigFormValues>) => {
    if (errors.leaveTypes) {
      toast.error('Allocated leave must equal total leave');
      const element = document.getElementById('leave-types-card');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>; // Could use a proper loading spinner here
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit, onInvalid)}>
        <PageHeader
          title="Leave Configuration"
          actions={
            <Button variant="primary" type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          }
        />
        <LeaveRulesCard />
        <LeaveTypesCard />
      </form>
    </FormProvider>
  );
};

export default LeaveConfigPage;
