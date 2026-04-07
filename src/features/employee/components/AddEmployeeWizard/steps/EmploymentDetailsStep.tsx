/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/incompatible-library */
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Input } from '../../../../../components/ui/Input/Input';
import { Button, Select } from '../../../../../components/common';
import { useWizard } from '../WizardContext';
import { useEmployeeWizard } from '../../../hooks/useEmployeeWizard';
import { useDepartments } from '../../../../department/hooks/useDepartments';
import { useDesignations } from '../../../../designation/hooks/useDesignations';
import { useEmployeeDropdown } from '../../../hooks/useEmployeeDropdown';
import { WorkLocation } from '../../../types/employeeType';

import styles from './EmploymentDetailsStep.module.scss';

const schema = z.object({
  departmentId: z.string().min(1, 'Department is required'),
  designationId: z.string().min(1, 'Designation is required'),
  reportsTo: z.string().min(1, 'Reporting manager is required'),
  employmentDate: z.string().min(1, 'Employment date is required'),
  joiningDate: z.string().min(1, 'Date of joining is required'),
  workLocation: z.string().optional(),
  probationPeriod: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface EmploymentDetailsStepProps {
  onClose: () => void;
}

export const EmploymentDetailsStep: React.FC<EmploymentDetailsStepProps> = ({ onClose }) => {
  const { employeeId, formData, updateFormData, nextStep } = useWizard();
  const { employmentMutation } = useEmployeeWizard();

  const { data: departmentsData } = useDepartments();
  const { data: designationsData } = useDesignations();
  const { data: employeesData } = useEmployeeDropdown();

  const departmentOptions = (departmentsData?.data?.data || []).map((d: any) => ({
    label: d.name,
    value: d.id,
  }));

  const designationOptions = (designationsData?.data || []).map((d: any) => ({
    label: d.title,
    value: d.id,
  }));

  const reporterOptions = (employeesData?.data || []).map((e: any) => ({
    label: e.name,
    value: e.id,
  }));

  const locationOptions = [
    { label: 'Onsite', value: WorkLocation.ONSITE },
    { label: 'Remote', value: WorkLocation.REMOTE },
    { label: 'Hybrid', value: WorkLocation.HYBRID },
  ];

  const probationOptions = [
    { label: 'No Probation', value: 'none' },
    { label: '3 Months', value: '3 Months' },
    { label: '6 Months', value: '6 Months' },
  ];

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      departmentId: formData.departmentId || '',
      designationId: formData.designationId || '',
      reportsTo: formData.reportsTo || '',
      employmentDate: formData.employmentDate || '',
      joiningDate: formData.joiningDate || '',
      workLocation: formData.workLocation || WorkLocation.ONSITE,
      probationPeriod: formData.probationPeriod || '3 Months',
      notes: formData.notes || '',
    },
  });

  // Auto-save to context on change via subscription
  React.useEffect(() => {
    const subscription = watch((value) => {
      updateFormData(value);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateFormData]);

  const onSubmit = (data: FormData) => {
    updateFormData(data);

    if (!employeeId) return;

    employmentMutation.mutate(
      {
        id: employeeId,
        data: {
          ...data,
          // API expects these to be UUIDs, which they are
        },
      },
      {
        onSuccess: () => {
          nextStep();
        },
      },
    );
  };

  const handleSaveDraft = () => {
    // Already saved via auto-sync, just close
    onClose();
  };

  const isPending = employmentMutation.isPending;

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.empIdBadge}>EMPID: EMP-1012</div>

      <Controller
        name="departmentId"
        control={control}
        render={({ field }) => (
          <Select
            label="Department"
            required
            placeholder="Select department"
            options={departmentOptions}
            value={field.value}
            onChange={field.onChange}
            error={errors.departmentId?.message}
          />
        )}
      />

      <Controller
        name="designationId"
        control={control}
        render={({ field }) => (
          <Select
            label="Designation"
            required
            placeholder="Select designation"
            options={designationOptions}
            value={field.value}
            onChange={field.onChange}
            error={errors.designationId?.message}
          />
        )}
      />

      <Controller
        name="reportsTo"
        control={control}
        render={({ field }) => (
          <Select
            label="Reporting Manager"
            required
            placeholder="Select reporting manager"
            options={reporterOptions}
            value={field.value}
            onChange={field.onChange}
            error={errors.reportsTo?.message}
          />
        )}
      />

      <div className={styles.row}>
        <Input
          label="Employment Date"
          type="date"
          required
          {...register('employmentDate')}
          error={errors.employmentDate?.message}
        />
        <Input
          label="Date of Joining"
          type="date"
          required
          {...register('joiningDate')}
          error={errors.joiningDate?.message}
        />
      </div>

      <div className={styles.row}>
        <Controller
          name="workLocation"
          control={control}
          render={({ field }) => (
            <Select
              label="Work Location (Optional)"
              options={locationOptions}
              value={field.value || ''}
              onChange={field.onChange}
              error={errors.workLocation?.message}
            />
          )}
        />
        <Controller
          name="probationPeriod"
          control={control}
          render={({ field }) => (
            <Select
              label="Probation (Optional)"
              options={probationOptions}
              value={field.value || ''}
              onChange={field.onChange}
              error={errors.probationPeriod?.message}
            />
          )}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          Notes (Optional)<span className={styles.asterisk}>*</span>
        </label>
        <textarea className={styles.textarea} placeholder="Add notes" {...register('notes')} />
        {errors.notes && <span className={styles.errorMessage}>{errors.notes.message}</span>}
      </div>

      <div className={styles.actions}>
        <Button
          variant="secondary"
          type="button"
          onClick={handleSaveDraft}
          className={styles.saveDraftButton}
          isLoading={isPending}
        >
          Save draft
        </Button>
        <Button variant="primary" type="submit" className={styles.nextButton} isLoading={isPending}>
          Next
        </Button>
      </div>
    </form>
  );
};
