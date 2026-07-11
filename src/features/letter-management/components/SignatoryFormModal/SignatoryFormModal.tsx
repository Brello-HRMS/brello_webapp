import React, { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X } from 'lucide-react';

import { Dialog, Button, ToggleButton } from '../../../../components/common';
import { Input } from '../../../../components/ui/Input/Input';
import { signatorySchema } from '../../validation/letterSchemas';
import { useCreateSignatory, useUpdateSignatory } from '../../hooks/useSignatories';

import styles from './SignatoryFormModal.module.scss';

import type { SignatoryFormInput, SignatoryFormOutput } from '../../validation/letterSchemas';
import type { Signatory } from '../../types/letterTypes';

interface SignatoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  signatory: Signatory | null;
}

const initialFormValues: SignatoryFormInput = {
  name: '',
  designation: '',
  is_default: false,
};

export const SignatoryFormModal: React.FC<SignatoryFormModalProps> = ({
  isOpen,
  onClose,
  signatory,
}) => {
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const { mutate: createSignatory, isPending: isCreating } = useCreateSignatory();
  const { mutate: updateSignatory, isPending: isUpdating } = useUpdateSignatory();

  const isPending = isCreating || isUpdating;
  const isEdit = !!signatory;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<SignatoryFormInput>({
    resolver: zodResolver(signatorySchema),
    defaultValues: initialFormValues,
  });

  const isDefault = useWatch({ control, name: 'is_default' });

  // Note: the parent remounts this component on a fresh `key` every time the
  // modal is opened (see SignatoriesPage), so `signatureFile`/`previewUrl`/
  // `fileError` always start clean — only the RHF form values need syncing here.
  useEffect(() => {
    if (isOpen) {
      if (signatory) {
        reset({
          name: signatory.name,
          designation: signatory.designation,
          is_default: signatory.is_default,
        });
      } else {
        reset(initialFormValues);
      }
    }
  }, [isOpen, signatory, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setSignatureFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFileError(null);
    }
  };

  const handleRemoveFile = () => {
    setSignatureFile(null);
    setPreviewUrl(null);
  };

  const onSubmit = (data: SignatoryFormOutput) => {
    if (isEdit && signatory) {
      updateSignatory(
        {
          id: signatory.id,
          params: {
            name: data.name,
            designation: data.designation,
            is_default: data.is_default,
          },
        },
        { onSuccess: () => onClose() },
      );
      return;
    }

    if (!signatureFile) {
      setFileError('Please upload a signature image');
      return;
    }

    createSignatory(
      {
        name: data.name,
        designation: data.designation,
        is_default: data.is_default,
        file: signatureFile,
      },
      { onSuccess: () => onClose() },
    );
  };

  const actions = (
    <div className={styles.actions}>
      <Button
        variant="secondary"
        onClick={onClose}
        type="button"
        className={styles.cancelAction}
        disabled={isPending}
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit(onSubmit)}
        type="submit"
        className={styles.saveAction}
        isLoading={isPending}
      >
        {isEdit ? 'Save changes' : 'Create signatory'}
      </Button>
    </div>
  );

  return (
    <Dialog
      title={isEdit ? 'Edit Signatory' : 'Add New Signatory'}
      open={isOpen}
      onClose={onClose}
      actions={actions}
      maxWidth="500px"
      position="right"
    >
      <form className={styles.formContainer} onSubmit={handleSubmit(onSubmit)}>
        {!isEdit && (
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Signature Image<span className={styles.required}>*</span>
            </label>
            <div className={styles.uploadArea}>
              {previewUrl ? (
                <div className={styles.previewWrapper}>
                  <img src={previewUrl} alt="Signature preview" className={styles.preview} />
                  <button type="button" className={styles.removeButton} onClick={handleRemoveFile}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className={styles.uploadPlaceholder}>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    className={styles.fileInput}
                    onChange={handleFileChange}
                  />
                  <div className={styles.iconWrapper}>
                    <Upload size={20} />
                  </div>
                  <span className={styles.uploadText}>Upload Signature</span>
                </label>
              )}
            </div>
            {fileError && <span className={styles.errorText}>{fileError}</span>}
          </div>
        )}

        <div className={styles.formGroup}>
          <Input
            label="Name"
            required
            placeholder="e.g., John Doe"
            {...register('name')}
            error={errors.name?.message}
          />
        </div>

        <div className={styles.formGroup}>
          <Input
            label="Designation"
            required
            placeholder="e.g., HR Manager"
            {...register('designation')}
            error={errors.designation?.message}
          />
        </div>

        <div className={styles.statusRow}>
          <div>
            <label className={styles.statusLabel}>Default Signatory</label>
            <span className={styles.statusSubLabel}>
              Use this signatory by default on generated letters
            </span>
          </div>
          <div className={styles.toggleContainer}>
            <ToggleButton
              checked={!!isDefault}
              onChange={(checked) => setValue('is_default', checked)}
            />
          </div>
        </div>
      </form>
    </Dialog>
  );
};
