import React, { useEffect, useRef, useState } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Upload, X, FileText, Loader2 } from 'lucide-react';

import { Dialog } from '../../../../components/common/Dialog/Dialog';
import { Input } from '../../../../components/ui/Input/Input';
import { TextArea } from '../../../../components/ui/TextArea/TextArea';
import { DatePicker } from '../../../../components/ui/DatePicker/DatePicker';
import { Button } from '../../../../components/common/Button/Button';
import { uploadDocumentUrl, uploadDocumentData } from '../../../../api/documents';
import {
  addReimbursementSchema,
  type AddReimbursementFormData,
} from '../../validation/reimbursementSchema';
import { useCreateReimbursement, useUpdateReimbursement } from '../../hooks/useReimbursement';

import styles from './AddReimbursementModal.module.scss';

import type { Reimbursement } from '../../types/reimbursementTypes';

interface UploadedFile {
  documentId: string;
  name: string;
  size: number;
}

interface AddReimbursementModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingReimbursement?: Reimbursement | null;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const AddReimbursementModal: React.FC<AddReimbursementModalProps> = ({
  isOpen,
  onClose,
  editingReimbursement,
}) => {
  const { createReimbursement, isCreating } = useCreateReimbursement();
  const { updateReimbursement, isUpdating } = useUpdateReimbursement();

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [attachmentError, setAttachmentError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!editingReimbursement;
  const isSaving = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<AddReimbursementFormData>({
    resolver: zodResolver(addReimbursementSchema),
    defaultValues: { title: '', expense_description: '', expense_date: '', amount: '' },
  });

  useEffect(() => {
    if (isOpen) {
      if (editingReimbursement) {
        reset({
          title: editingReimbursement.title,
          expense_description: editingReimbursement.expense_description ?? '',
          expense_date: editingReimbursement.expense_date?.split('T')[0] ?? '',
          amount: String(editingReimbursement.amount),
        });
        setUploadedFiles(
          editingReimbursement.attachments.map((a) => ({
            documentId: a.document_id,
            name: a.original_name ?? a.document_id,
            size: 0,
          })),
        );
      } else {
        reset({ title: '', expense_description: '', expense_date: '', amount: '' });
        setUploadedFiles([]);
      }
      setAttachmentError('');
    }
  }, [isOpen, editingReimbursement, reset]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    const valid = files.filter((f) => allowed.includes(f.type) && f.size <= 10 * 1024 * 1024);

    if (valid.length !== files.length) {
      setAttachmentError('Only PDF, JPG, PNG files under 10 MB are allowed.');
      return;
    }

    setAttachmentError('');
    setUploadingCount((c) => c + valid.length);

    await Promise.all(
      valid.map(async (file) => {
        try {
          const urlRes = await uploadDocumentUrl({
            folderType: 'REIMBURSEMENT_DOCUMENT',
            originalName: file.name,
            mimeType: file.type,
            size: file.size,
          });
          await uploadDocumentData(urlRes.data.documentId, file);
          setUploadedFiles((prev) => [
            ...prev,
            { documentId: urlRes.data.documentId, name: file.name, size: file.size },
          ]);
        } catch {
          setAttachmentError('Failed to upload one or more files. Please try again.');
        } finally {
          setUploadingCount((c) => c - 1);
        }
      }),
    );

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (documentId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.documentId !== documentId));
  };

  const onSubmit: SubmitHandler<AddReimbursementFormData> = async (data) => {
    if (uploadedFiles.length === 0 && !isEditing) {
      setAttachmentError('At least one attachment is required.');
      return;
    }

    if (isEditing && editingReimbursement) {
      const existingIds = editingReimbursement.attachments.map((a) => a.document_id);
      const currentIds = uploadedFiles.map((f) => f.documentId);
      const addIds = currentIds.filter((id) => !existingIds.includes(id));
      const removeIds = existingIds.filter((id) => !currentIds.includes(id));

      await updateReimbursement({
        id: editingReimbursement.id,
        data: {
          title: data.title,
          expense_description: data.expense_description,
          expense_date: data.expense_date,
          amount: Number(data.amount),
          add_document_ids: addIds,
          remove_document_ids: removeIds,
          version: editingReimbursement.version,
        },
      });
    } else {
      await createReimbursement({
        title: data.title,
        expense_description: data.expense_description,
        expense_date: data.expense_date,
        amount: Number(data.amount),
        document_ids: uploadedFiles.map((f) => f.documentId),
      });
    }

    onClose();
  };

  return (
    <Dialog
      title={isEditing ? 'Edit Reimbursement' : 'Add Reimbursement'}
      open={isOpen}
      onClose={onClose}
      maxWidth="560px"
      position="right"
      actions={
        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving || uploadingCount > 0 || isDirty}
          >
            {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Submit Reimbursement'}
          </Button>
        </div>
      }
    >
      <div className={styles.form}>
        <Input
          label="Title"
          required
          placeholder="e.g. Client Dinner"
          error={errors.title?.message}
          {...register('title')}
        />

        <div className={styles.row}>
          <Controller
            name="expense_date"
            control={control}
            render={({ field }) => (
              <DatePicker
                label="Date"
                required
                value={field.value}
                onChange={field.onChange}
                error={errors.expense_date?.message}
              />
            )}
          />
          <Input
            label="Amount (₹)"
            required
            type="number"
            placeholder="e.g. 2500"
            error={errors.amount?.message}
            {...register('amount')}
          />
        </div>

        <TextArea
          label="Description"
          placeholder="Provide your description"
          rows={3}
          {...register('expense_description')}
        />

        <div>
          <label
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--color-text-primary-500)',
              display: 'block',
              marginBottom: 8,
            }}
          >
            Attachments <span style={{ color: 'var(--color-error)' }}>*</span>
          </label>

          <div className={styles.uploadArea} onClick={() => fileInputRef.current?.click()}>
            <Upload size={20} className={styles.uploadIcon} />
            <span className={styles.uploadLabel}>Click to upload files</span>
            <span className={styles.uploadHint}>PDF, JPG, PNG · max 10 MB</span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            multiple
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {attachmentError && <p className={styles.errorText}>{attachmentError}</p>}

          {uploadingCount > 0 && (
            <div className={styles.uploadingFile}>
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Uploading {uploadingCount} file{uploadingCount > 1 ? 's' : ''}...
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <div className={styles.fileList}>
              {uploadedFiles.map((f) => (
                <div key={f.documentId} className={styles.fileItem}>
                  <FileText
                    size={14}
                    style={{ color: 'var(--color-primary-border)', flexShrink: 0 }}
                  />
                  <span className={styles.fileName}>{f.name}</span>
                  {f.size > 0 && <span className={styles.fileSize}>{formatFileSize(f.size)}</span>}
                  <button
                    type="button"
                    className={styles.removeFile}
                    onClick={() => removeFile(f.documentId)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};
