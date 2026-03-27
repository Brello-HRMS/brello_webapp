import React from 'react';
import { motion } from 'framer-motion';
import { Controller } from 'react-hook-form';

import { Input } from '../../../../../components/ui/Input/Input';
import { Select } from '../../../../../components/common';
import { TextArea } from '../../../../../components/ui/TextArea/TextArea';
import { DatePicker } from '../../../../../components/ui/DatePicker/DatePicker';
import { TYPE_OPTIONS, STATUS_OPTIONS, PRIORITY_OPTIONS } from '../../../constants/projectOptions';
import styles from '../../AddProjectModal.module.scss';
import { ProjectStatus, ProjectPriority, ProjectType } from '../../../types/projectType';

import type { ProjectFormData } from '../../../schemas/projectSchema';
import type {
  UseFormRegister,
  Control,
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';

interface BasicInfoTabProps {
  register: UseFormRegister<ProjectFormData>;
  control: Control<ProjectFormData>;
  errors: FieldErrors<ProjectFormData>;
  setValue: UseFormSetValue<ProjectFormData>;
  watch: UseFormWatch<ProjectFormData>;
}

export const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  register,
  control,
  errors,
  setValue,
  watch,
}) => {
  const selectedType = watch('project_type');
  const selectedStatus = watch('project_status');
  const selectedPriority = watch('priority');

  return (
    <motion.div
      key="basic"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className={styles.formGrid}
    >
      <Input
        label="Project Name"
        required
        {...register('name')}
        error={errors.name?.message}
        placeholder="Enter project name"
      />

      <Select
        label="Project Type"
        required
        options={TYPE_OPTIONS}
        value={selectedType}
        onChange={(val: string | number) => setValue('project_type', val as ProjectType)}
        error={errors.project_type?.message}
        placeholder="Select type"
      />

      <Select
        label="Status"
        required
        options={STATUS_OPTIONS}
        value={selectedStatus}
        onChange={(val: string | number) => setValue('project_status', val as ProjectStatus)}
        error={errors.project_status?.message}
        placeholder="Select status"
      />

      <Select
        label="Priority"
        required
        options={PRIORITY_OPTIONS}
        value={selectedPriority}
        onChange={(val: string | number) => setValue('priority', val as ProjectPriority)}
        error={errors.priority?.message}
        placeholder="Select priority"
      />

      <Controller
        name="start_date"
        control={control}
        render={({ field }) => (
          <DatePicker
            label="Start Date (Optional)"
            value={field.value}
            onChange={field.onChange}
            error={errors.start_date?.message}
          />
        )}
      />

      <Controller
        name="end_date"
        control={control}
        render={({ field }) => (
          <DatePicker
            label="End Date (Optional)"
            value={field.value}
            onChange={field.onChange}
            error={errors.end_date?.message}
          />
        )}
      />

      <div className={styles.fullWidth}>
        <TextArea
          label="Description (Optional)"
          {...register('description')}
          placeholder="Add project description"
        />
      </div>
    </motion.div>
  );
};
