import React, { useMemo, useEffect } from 'react';
import { useForm, Controller, useWatch, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';

import { getSalaryTemplateSchema } from '../../validation/payrollSchema';
import { Input } from '../../../../components/ui/Input/Input';
import { TextArea } from '../../../../components/ui/TextArea/TextArea';
import { Select } from '../../../../components/common/Select/Select';
import { ToggleButton } from '../../../../components/common/ToggleButton/ToggleButton';
import { Button } from '../../../../components/common/Button/Button';
import { Dialog } from '../../../../components/common/Dialog/Dialog';

import styles from './CreateSalaryTemplateModal.module.scss';

import type {
  CreateTemplateFormData,
  SalaryComponent,
  SalaryTemplate,
} from '../../types/payrollConfigTypes';

interface CreateSalaryTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateTemplateFormData) => void;
  availableComponents: SalaryComponent[];
  initialData?: SalaryTemplate | null;
}

export const CreateSalaryTemplateModal: React.FC<CreateSalaryTemplateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  availableComponents,
  initialData,
}) => {
  const salaryTemplateSchema = useMemo(
    () => getSalaryTemplateSchema(availableComponents),
    [availableComponents],
  );

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CreateTemplateFormData>({
    resolver: zodResolver(salaryTemplateSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description || '',
          componentIds: initialData.components.map((c) => c.component_id),
          status: initialData.is_active,
        }
      : {
          name: '',
          description: '',
          componentIds: [],
          status: true,
        },
  });

  const componentIds =
    useWatch({
      control,
      name: 'componentIds',
    }) || [];

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          name: initialData.name,
          description: initialData.description || '',
          componentIds: initialData.components.map((c) => c.component_id),
          status: initialData.is_active,
        });
      } else {
        reset({
          name: '',
          description: '',
          componentIds: [],
          status: true,
        });
      }
    }
  }, [isOpen, initialData, reset]);

  const handleAddComponent = (id: string | number) => {
    const componentId = String(id);
    if (!componentIds.includes(componentId)) {
      const newComponentIds = [...componentIds, componentId];
      // UUID-based: auto-add the base component if this one depends on one
      const componentToAdd = availableComponents.find((c) => c.id === componentId);
      const baseId = componentToAdd?.calculate_from;
      if (baseId && !newComponentIds.includes(baseId)) {
        newComponentIds.push(baseId);
      }
      setValue('componentIds', newComponentIds, { shouldValidate: true });
      clearErrors('componentIds');
    }
  };

  const handleRemoveComponent = (id: string) => {
    const componentToRemove = availableComponents.find((c) => c.id === id);
    if (componentToRemove?.name === 'Basic Salary' || componentToRemove?.name === 'Basic') {
      setError('componentIds', { message: 'Basic Salary is mandatory and cannot be removed.' });
      return;
    }

    // UUID-based: block removal if another selected component depends on this one
    const dependents = availableComponents.filter(
      (c) => componentIds.includes(c.id) && c.calculate_from === id,
    );
    if (dependents.length > 0) {
      setError('componentIds', {
        message: `Cannot remove "${componentToRemove?.name}" — "${dependents[0].name}" depends on it.`,
      });
      return;
    }

    const newComponentIds = componentIds.filter((cid) => cid !== id);
    setValue('componentIds', newComponentIds, { shouldValidate: true });
    clearErrors('componentIds');
  };

  const onSubmit: SubmitHandler<CreateTemplateFormData> = (data) => {
    onSave(data);
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  const availableOptions = availableComponents
    .filter((component) => !componentIds.includes(component.id))
    .map((component) => ({
      value: component.id,
      label: component.name,
      description: `${component.component_type} (${component.calculation_type})`,
    }));

  const selectedComponents = availableComponents.filter((component) =>
    componentIds.includes(component.id),
  );

  return (
    <Dialog
      title={initialData ? 'Edit Salary Template' : 'Create Salary Template'}
      open={isOpen}
      onClose={handleClose}
      maxWidth="480px"
      actions={
        <div className={styles.footer}>
          <div className={styles.footerActions}>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit(onSubmit)}>
              {initialData ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </div>
      }
      position="right"
    >
      <div className={styles.formBody}>
        <Input
          label="Template Name"
          required
          placeholder="e.g. Standard CTC"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className={styles.field}>
          <TextArea
            label="Description"
            placeholder="Brief description of this salary structure..."
            rows={3}
            error={errors.description?.message}
            {...register('description')}
          />
        </div>

        <div className={styles.field}>
          <Select
            label="Components"
            required={componentIds.length === 0}
            placeholder="Select component to add..."
            options={availableOptions}
            value=""
            onChange={handleAddComponent}
            error={errors.componentIds?.message}
          />

          <div className={styles.selectedSection}>
            <label className={styles.subLabel}>Included Components</label>
            {selectedComponents.length > 0 ? (
              <div className={styles.selectedChips}>
                {selectedComponents.map((component) => (
                  <div key={component.id} className={styles.componentItem}>
                    <div className={styles.componentInfo}>
                      <span className={styles.compName}>{component.name}</span>
                      <span
                        className={`${styles.compTag} ${styles[component.component_type.toLowerCase()]}`}
                      >
                        {component.component_type}
                      </span>
                    </div>
                    {component.name !== 'Basic Salary' && component.name !== 'Basic' && (
                      <button
                        className={styles.itemRemove}
                        onClick={() => handleRemoveComponent(component.id)}
                        aria-label={`Remove ${component.name}`}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>No components selected yet.</div>
            )}
          </div>
        </div>

        <div className={styles.toggleRow}>
          <span className={styles.toggleLabel}>Status</span>
          <Controller
            name="status"
            control={control}
            render={({ field }) => <ToggleButton checked={field.value} onChange={field.onChange} />}
          />
        </div>
      </div>
    </Dialog>
  );
};
