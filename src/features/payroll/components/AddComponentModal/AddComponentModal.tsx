import React, { useState } from 'react';

import { Input } from '../../../../components/ui/Input/Input';
import { Select } from '../../../../components/common/Select/Select';
import { ToggleButton } from '../../../../components/common/ToggleButton/ToggleButton';
import { Button } from '../../../../components/common/Button/Button';
import { Dialog } from '../../../../components/common/Dialog/Dialog';

import styles from './AddComponentModal.module.scss';

import type { AddComponentFormData, SalaryComponent } from '../../types/payrollConfigTypes';

const TYPE_OPTIONS = [
  { value: 'earning', label: 'Earning' },
  { value: 'deduction', label: 'Deduction' },
];

const CALCULATION_TYPE_OPTIONS = [
  { value: 'fixed', label: 'Fixed' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'residual', label: 'Residual' },
];

const DEFAULT_FORM: AddComponentFormData = {
  name: '',
  type: 'earning',
  calculationType: 'fixed',
  amount: '',
  taxable: false,
  status: true,
};

interface AddComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: AddComponentFormData) => void;
  initialData?: SalaryComponent | null;
  availableComponents: SalaryComponent[];
}

export const AddComponentModal: React.FC<AddComponentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  availableComponents,
}) => {
  const [form, setForm] = useState<AddComponentFormData>(DEFAULT_FORM);

  const handleChange = <K extends keyof AddComponentFormData>(
    key: K,
    value: AddComponentFormData[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(form);
    setForm(DEFAULT_FORM);
    onClose();
  };

  const handleClose = () => {
    setForm(DEFAULT_FORM);
    onClose();
  };

  const isPercentage = form.calculationType === 'percentage';

  const componentOptions = [
    { value: 'CTC', label: 'CTC' },
    ...availableComponents
      .filter((c) => c.id !== initialData?.id)
      .map((c) => ({
        value: c.name,
        label: c.name,
      })),
  ];

  return (
    <Dialog
      title={initialData ? 'Edit Component' : 'Add Component'}
      open={isOpen}
      onClose={handleClose}
      maxWidth="480px"
      actions={
        <div className={styles.footer}>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
      }
      position="right"
    >
      <div className={styles.formBody}>
        <Input
          label="Component Name*"
          placeholder="e.g. Medical Allowance"
          value={form.name}
          onChange={(e) => handleChange('name', e.target.value)}
        />

        <Select
          label="Type"
          required
          options={TYPE_OPTIONS}
          value={form.type}
          onChange={(val) => handleChange('type', val as AddComponentFormData['type'])}
        />

        <Select
          label="Calculation Type"
          required
          options={CALCULATION_TYPE_OPTIONS}
          value={form.calculationType}
          onChange={(val) =>
            handleChange('calculationType', val as AddComponentFormData['calculationType'])
          }
        />

        {isPercentage && (
          <Select
            label="Percentage of*"
            required
            options={componentOptions}
            value={form.parentComponentId || 'CTC'}
            onChange={(val) => handleChange('parentComponentId', val as string)}
          />
        )}

        <Input
          label={isPercentage ? 'Percentage (%)*' : 'Amount (₹)*'}
          type="number"
          placeholder="0"
          value={form.amount}
          onChange={(e) => handleChange('amount', e.target.value)}
        />

        <div className={styles.toggleRow}>
          <span className={styles.toggleLabel}>Taxable</span>
          <ToggleButton
            checked={form.taxable}
            onChange={(checked) => handleChange('taxable', checked)}
          />
        </div>

        <div className={styles.toggleRow}>
          <span className={styles.toggleLabel}>Status</span>
          <ToggleButton
            checked={form.status}
            onChange={(checked) => handleChange('status', checked)}
          />
        </div>
      </div>
    </Dialog>
  );
};
