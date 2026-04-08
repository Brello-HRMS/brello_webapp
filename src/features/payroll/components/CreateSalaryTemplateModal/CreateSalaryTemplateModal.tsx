import React, { useState } from 'react';
import { X } from 'lucide-react';

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

const DEFAULT_FORM: CreateTemplateFormData = {
  name: '',
  description: '',
  componentIds: [],
  status: true,
};

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
  const [formData, setFormData] = useState<CreateTemplateFormData>(DEFAULT_FORM);
  const [error, setError] = useState<string | null>(null);

  const validateTemplate = (): string | null => {
    if (!formData.name.trim()) return 'Template name is required.';
    if (formData.componentIds.length === 0) return 'At least one component must be selected.';

    const selectedComponents = availableComponents.filter((component) =>
      formData.componentIds.includes(component.id),
    );

    // 1. Basic Salary Check
    const hasBasicSalary = selectedComponents.some(
      (component) => component.name === 'Basic Salary' || component.name === 'Basic',
    );
    if (!hasBasicSalary) return 'Template must include "Basic Salary".';

    // 2. Dependency Check
    for (const component of selectedComponents) {
      const calculationBase = component.calculation_value?.base;
      if (calculationBase && calculationBase !== 'CTC') {
        const hasDependencyBase = selectedComponents.some((comp) => comp.name === calculationBase);
        if (!hasDependencyBase) {
          return `Component "${component.name}" depends on "${calculationBase}", which is not included in this template.`;
        }
      }
    }

    return null;
  };

  const handleAddComponent = (id: string | number) => {
    const componentId = String(id);
    if (!formData.componentIds.includes(componentId)) {
      const newComponentIds = [...formData.componentIds, componentId];
      // Automatically add dependencies
      const componentToAdd = availableComponents.find((component) => component.id === componentId);
      const dependencyBaseName = componentToAdd?.calculation_value?.base;

      if (dependencyBaseName && dependencyBaseName !== 'CTC') {
        const dependencyBaseComponent = availableComponents.find(
          (component) => component.name === dependencyBaseName,
        );
        if (dependencyBaseComponent && !newComponentIds.includes(dependencyBaseComponent.id)) {
          newComponentIds.push(dependencyBaseComponent.id);
        }
      }

      setFormData((previousFormData) => ({ ...previousFormData, componentIds: newComponentIds }));
      setError(null);
    }
  };

  const handleRemoveComponent = (id: string) => {
    const componentToRemove = availableComponents.find((component) => component.id === id);
    if (componentToRemove?.name === 'Basic Salary' || componentToRemove?.name === 'Basic') {
      setError('Basic Salary is mandatory and cannot be removed.');
      return;
    }

    // Check if any other selected component depends on this one
    const dependents = availableComponents.filter(
      (component) =>
        formData.componentIds.includes(component.id) &&
        component.calculation_value?.base === componentToRemove?.name,
    );

    if (dependents.length > 0) {
      setError(
        `Cannot remove "${componentToRemove?.name}" because "${dependents[0].name}" depends on it.`,
      );
      return;
    }

    setFormData((previousFormData) => ({
      ...previousFormData,
      componentIds: previousFormData.componentIds.filter((componentId) => componentId !== id),
    }));
    setError(null);
  };

  const handleSave = () => {
    const validationError = validateTemplate();
    if (validationError) {
      setError(validationError);
      return;
    }
    onSave(formData);
    setFormData(DEFAULT_FORM);
    onClose();
  };

  const handleClose = () => {
    setFormData(DEFAULT_FORM);
    setError(null);
    onClose();
  };

  const availableOptions = availableComponents
    .filter((component: SalaryComponent) => !formData.componentIds.includes(component.id))
    .map((component: SalaryComponent) => ({
      value: component.id,
      label: component.name,
      description: `${component.type} (${component.calculation_type})`,
    }));

  const selectedComponents = availableComponents.filter((component: SalaryComponent) =>
    formData.componentIds.includes(component.id),
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
            <Button variant="primary" onClick={handleSave}>
              {initialData ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </div>
      }
      position="right"
    >
      <div className={styles.formBody}>
        {error && <div className={styles.errorBanner}>{error}</div>}
        <Input
          label="Template Name"
          required
          placeholder="e.g. Standard CTC"
          value={formData.name}
          onChange={(event) =>
            setFormData((previousFormData) => ({ ...previousFormData, name: event.target.value }))
          }
        />

        <div className={styles.field}>
          <TextArea
            label="Description"
            placeholder="Brief description of this salary structure..."
            value={formData.description}
            onChange={(event) =>
              setFormData((previousFormData) => ({
                ...previousFormData,
                description: event.target.value,
              }))
            }
            rows={3}
          />
        </div>

        <div className={styles.field}>
          <Select
            label="Components"
            required={formData.componentIds.length === 0}
            placeholder="Select component to add..."
            options={availableOptions}
            value=""
            onChange={handleAddComponent}
          />

          <div className={styles.selectedSection}>
            <label className={styles.subLabel}>Included Components</label>
            {selectedComponents.length > 0 ? (
              <div className={styles.selectedChips}>
                {selectedComponents.map((component) => (
                  <div key={component.id} className={styles.componentItem}>
                    <div className={styles.componentInfo}>
                      <span className={styles.compName}>{component.name}</span>
                      <span className={`${styles.compTag} ${styles[component.type.toLowerCase()]}`}>
                        {component.type}
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
          <ToggleButton
            checked={formData.status}
            onChange={(checked) =>
              setFormData((previousFormData) => ({ ...previousFormData, status: checked }))
            }
          />
        </div>
      </div>
    </Dialog>
  );
};
