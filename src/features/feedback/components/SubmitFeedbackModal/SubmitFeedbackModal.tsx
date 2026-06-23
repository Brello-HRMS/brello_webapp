import React, { useEffect, useRef, useState } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImagePlus, X, FileVideo } from 'lucide-react';
import { toast } from 'react-toastify';

import { Dialog } from '../../../../components/common/Dialog/Dialog';
import { Input } from '../../../../components/ui/Input/Input';
import { TextArea } from '../../../../components/ui/TextArea/TextArea';
import { Button } from '../../../../components/common/Button/Button';
import { Select, type SelectOption } from '../../../../components/common/Select/Select';
import { submitFeedbackSchema, type SubmitFeedbackFormData } from '../../validation/feedbackSchema';
import { useCreateFeedbackTicket } from '../../hooks/useFeedback';
import { FeedbackType, FeedbackCategory } from '../../enums/feedback.enum';
import { uploadDocumentUrl, uploadDocumentData } from '../../../../api/documents';

import styles from './SubmitFeedbackModal.module.scss';

const FEEDBACK_CATEGORY_OPTIONS: SelectOption[] = [
  { value: FeedbackCategory.FEATURE_REQUEST, label: 'Feature Request' },
  { value: FeedbackCategory.SUGGESTION, label: 'Suggestion' },
  { value: FeedbackCategory.PRAISE, label: 'Praise' },
];

const ISSUE_CATEGORY_OPTIONS: SelectOption[] = [
  { value: FeedbackCategory.BUG, label: 'Bug' },
  { value: FeedbackCategory.UI_UX, label: 'UI / UX Issue' },
  { value: FeedbackCategory.PERFORMANCE, label: 'Performance' },
  { value: FeedbackCategory.DATA_ISSUE, label: 'Data Issue' },
];

const ACCEPT_TYPES =
  'image/png,image/jpeg,image/webp,image/gif,video/mp4,video/quicktime,video/webm';
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

interface UploadedFile {
  documentId: string;
  name: string;
  mimeType: string;
  previewUrl?: string;
  uploading: boolean;
  error?: string;
}

interface SubmitFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: FeedbackType;
}

export const SubmitFeedbackModal: React.FC<SubmitFeedbackModalProps> = ({
  isOpen,
  onClose,
  defaultType,
}) => {
  const { createTicket, isCreating } = useCreateFeedbackTicket();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const activeType = defaultType ?? FeedbackType.FEEDBACK;
  const categoryOptions =
    activeType === FeedbackType.FEEDBACK ? FEEDBACK_CATEGORY_OPTIONS : ISSUE_CATEGORY_OPTIONS;
  const dialogTitle = activeType === FeedbackType.FEEDBACK ? 'Submit Feedback' : 'Report an Issue';

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<SubmitFeedbackFormData>({
    resolver: zodResolver(submitFeedbackSchema),
    defaultValues: {
      type: activeType,
      category:
        activeType === FeedbackType.FEEDBACK
          ? FeedbackCategory.FEATURE_REQUEST
          : FeedbackCategory.BUG,
      title: '',
      ticket_description: '',
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    const id = setTimeout(() => {
      reset({
        type: activeType,
        category:
          activeType === FeedbackType.FEEDBACK
            ? FeedbackCategory.FEATURE_REQUEST
            : FeedbackCategory.BUG,
        title: '',
        ticket_description: '',
      });
      setUploadedFiles([]);
    }, 0);
    return () => clearTimeout(id);
  }, [isOpen, activeType, reset]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';

    for (const file of files) {
      const isVideo = file.type.startsWith('video/');
      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      if (file.size > maxSize) {
        toast.error(`"${file.name}" exceeds the ${isVideo ? '50 MB' : '10 MB'} size limit.`);
        continue;
      }

      const tempId = crypto.randomUUID();
      const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;

      setUploadedFiles((prev) => [
        ...prev,
        { documentId: tempId, name: file.name, mimeType: file.type, previewUrl, uploading: true },
      ]);

      try {
        const { data } = await uploadDocumentUrl({
          folderType: 'FEEDBACK_ATTACHMENT',
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
        });
        await uploadDocumentData(data.documentId, file);
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.documentId === tempId ? { ...f, documentId: data.documentId, uploading: false } : f,
          ),
        );
      } catch {
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.documentId === tempId ? { ...f, uploading: false, error: 'Upload failed' } : f,
          ),
        );
      }
    }
  };

  const removeFile = (documentId: string) => {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.documentId === documentId);
      if (file?.previewUrl) URL.revokeObjectURL(file.previewUrl);
      return prev.filter((f) => f.documentId !== documentId);
    });
  };

  const onSubmit: SubmitHandler<SubmitFeedbackFormData> = async (data) => {
    const completedAttachments = uploadedFiles
      .filter((f) => !f.uploading && !f.error)
      .map((f) => ({ document_id: f.documentId, name: f.name, mime_type: f.mimeType }));

    await createTicket({
      type: data.type,
      category: data.category,
      title: data.title,
      ticket_description: data.ticket_description,
      attachments: completedAttachments.length ? completedAttachments : undefined,
    });
    onClose();
  };

  const isUploading = uploadedFiles.some((f) => f.uploading);

  return (
    <Dialog
      title={dialogTitle}
      open={isOpen}
      onClose={onClose}
      maxWidth="520px"
      position="right"
      actions={
        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose} disabled={isCreating || isUploading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            isLoading={isCreating}
            disabled={isUploading}
          >
            Submit
          </Button>
        </div>
      }
    >
      <div className={styles.form}>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Select
              label="Category"
              required
              options={categoryOptions}
              value={field.value}
              onChange={(v) => field.onChange(v)}
              placeholder="Select category"
              error={errors.category?.message}
            />
          )}
        />

        <Input
          label="Title"
          required
          placeholder="Brief summary of your feedback or issue"
          error={errors.title?.message}
          {...register('title')}
        />

        <TextArea
          label="Description"
          required
          placeholder="Describe in detail — steps to reproduce, expected vs actual, or your idea"
          rows={4}
          error={errors.ticket_description?.message}
          {...register('ticket_description')}
        />

        <div className={styles.uploadSection}>
          <label className={styles.label}>Attachments</label>
          <div className={styles.uploadArea} onClick={() => fileInputRef.current?.click()}>
            <ImagePlus size={20} className={styles.uploadIcon} />
            <span className={styles.uploadText}>Add images or videos</span>
            <span className={styles.uploadHint}>PNG, JPG, GIF · MP4, MOV · Max 10 MB / 50 MB</span>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPT_TYPES}
            onChange={handleFileChange}
            className={styles.hiddenInput}
          />
          {uploadedFiles.length > 0 && (
            <div className={styles.fileList}>
              {uploadedFiles.map((file) => (
                <div key={file.documentId} className={styles.fileItem}>
                  {file.mimeType.startsWith('image/') && file.previewUrl ? (
                    <img src={file.previewUrl} alt={file.name} className={styles.fileThumb} />
                  ) : (
                    <div className={styles.fileThumbVideo}>
                      <FileVideo size={18} />
                    </div>
                  )}
                  <span className={`${styles.fileName} ${file.error ? styles.fileError : ''}`}>
                    {file.error ? 'Upload failed' : file.name}
                  </span>
                  {file.uploading && <span className={styles.uploadingDot} />}
                  <button
                    type="button"
                    className={styles.removeFile}
                    onClick={() => removeFile(file.documentId)}
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
