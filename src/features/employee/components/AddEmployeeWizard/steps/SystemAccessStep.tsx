/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/incompatible-library */
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AlertCircle, X, Plus } from 'lucide-react';

import { Button, Select } from '../../../../../components/common';
import { useWizard } from '../WizardContext';
import { useEmployeeWizard } from '../../../hooks/useEmployeeWizard';
import { useRoles } from '../../../../../hooks/useRoles';

import styles from './SystemAccessStep.module.scss';

const schema = z.object({
  roleId: z.string().min(1, 'Role is required'),
});

type FormData = z.infer<typeof schema>;

interface SystemAccessStepProps {
  onClose: () => void;
}

export const SystemAccessStep: React.FC<SystemAccessStepProps> = ({ onClose }) => {
  const { employeeId, formData, updateFormData, nextStep, isEditMode } = useWizard();
  const { systemAccessMutation } = useEmployeeWizard();
  const { data: rolesResponse, isLoading: isLoadingRoles } = useRoles();
  const [selectedAssets, setSelectedAssets] = useState<string[]>(formData.assignedAssets || []);
  const [isAddingAsset, setIsAddingAsset] = useState<boolean>(false);
  const [newAsset, setNewAsset] = useState<string>('');

  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      roleId: formData.roleId || '',
    },
  });

  const selectedRoleId = watch('roleId');
  const roles = rolesResponse?.data?.data || [];
  const selectedRole = roles.find((r: any) => r.id === selectedRoleId);

  // Auto-save form fields to context via subscription
  React.useEffect(() => {
    const subscription = watch((value) => {
      updateFormData(value as FormData);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateFormData]);

  // Auto-save assets to context
  React.useEffect(() => {
    updateFormData({ assignedAssets: selectedAssets });
  }, [selectedAssets, updateFormData]);

  const handleAddAsset = () => {
    if (newAsset.trim() && !selectedAssets.includes(newAsset.trim())) {
      setSelectedAssets([...selectedAssets, newAsset.trim()]);
    }
    setNewAsset('');
    setIsAddingAsset(false);
  };

  const handleAssetInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAsset();
    } else if (e.key === 'Escape') {
      setNewAsset('');
      setIsAddingAsset(false);
    }
  };

  const handleRemoveAsset = (assetToRemove: string) => {
    setSelectedAssets(selectedAssets.filter((a) => a !== assetToRemove));
  };

  const onSubmit = (data: FormData) => {
    const finalData = { ...data, assignedAssets: selectedAssets };
    updateFormData(finalData);

    if (!employeeId) return;

    systemAccessMutation.mutate(
      { id: employeeId, data: finalData },
      {
        onSuccess: () => {
          nextStep();
        },
      },
    );
  };

  const handleSaveDraft = () => {
    onClose();
  };

  const roleOptions = roles.map((r: any) => ({
    label:
      r.name.charAt(0).toUpperCase() +
      r.name.slice(1) +
      (r.name.toLowerCase() === 'employee' ? ' (Standard Access)' : ''),
    value: r.id,
  }));

  const isPending = systemAccessMutation.isPending;

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.section}>
        <h3 className={styles.groupTitle}>SALARY STRUCTURE</h3>
        <Controller
          name="roleId"
          control={control}
          render={({ field }) => (
            <Select
              label="Select System Role"
              required
              options={roleOptions}
              value={field.value}
              onChange={field.onChange}
              error={errors.roleId?.message}
            />
          )}
        />
        {selectedRole && (
          <div className={styles.roleInfoBox}>
            <div className={styles.roleInfoIcon}>
              <AlertCircle size={18} />
            </div>
            <p className={styles.roleInfoText}>
              {selectedRole.description ||
                'This role grants specific standard permissions across the platform.'}
            </p>
          </div>
        )}
      </div>

      <div className={styles.sectionDivider} />

      <div className={styles.section}>
        <h3 className={styles.groupTitle}>ASSET ASSIGNMENT</h3>
        <div className={styles.assetsWrapper}>
          <label className={styles.inputLabel}>
            Allocated Equipment<span className={styles.required}>*</span>
          </label>
          <div className={styles.chipContainer}>
            {selectedAssets.map((asset) => (
              <div key={asset} className={styles.assetChip}>
                {asset}
                <button
                  type="button"
                  onClick={() => handleRemoveAsset(asset)}
                  aria-label="Remove asset"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {isAddingAsset ? (
              <input
                type="text"
                autoFocus
                className={styles.assetInput}
                value={newAsset}
                onChange={(e) => setNewAsset(e.target.value)}
                onKeyDown={handleAssetInputKeyDown}
                onBlur={handleAddAsset}
                placeholder="Type and press Enter..."
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsAddingAsset(true)}
                className={styles.addAssetChip}
              >
                <Plus size={14} /> Assign New Asset
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <Button
          variant="secondary"
          type="button"
          onClick={isEditMode ? onClose : handleSaveDraft}
          className={styles.saveDraftButton}
          disabled={isPending}
        >
          {isEditMode ? 'Cancel' : 'Save draft'}
        </Button>
        <Button
          variant="primary"
          type="submit"
          className={styles.nextButton}
          isLoading={isPending || isLoadingRoles}
        >
          Next
        </Button>
      </div>
    </form>
  );
};
