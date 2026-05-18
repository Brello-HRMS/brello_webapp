import React, { useEffect } from 'react';
import { useForm, Controller, type SubmitHandler, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Dialog } from '../../../../components/common/Dialog/Dialog';
import { Button } from '../../../../components/common/Button/Button';
import { Select, type SelectOption } from '../../../../components/common/Select/Select';
import { MarkdownEditor } from '../../../../components/common/MarkdownEditor/MarkdownEditor';
import { Input } from '../../../../components/ui/Input/Input';
import { useCreateAnnouncement, useUpdateAnnouncement } from '../../hooks/useAnnouncement';
import {
  announcementSchema,
  type AnnouncementSchemaType,
} from '../../validation/announcementSchema';
import {
  AnnouncementAudienceType,
  AnnouncementPriority,
  AnnouncementPublishType,
} from '../../types/announcementTypes';

import styles from './CreateAnnouncementModal.module.scss';

import type { Announcement } from '../../types/announcementTypes';

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAnnouncement?: Announcement | null;
}

const PRIORITY_OPTIONS: SelectOption[] = [
  { value: AnnouncementPriority.NORMAL, label: 'Normal' },
  { value: AnnouncementPriority.IMPORTANT, label: 'Important' },
  { value: AnnouncementPriority.URGENT, label: 'Urgent' },
];

const PUBLISH_TYPE_OPTIONS: SelectOption[] = [
  { value: AnnouncementPublishType.INSTANT, label: 'Publish immediately' },
  { value: AnnouncementPublishType.SCHEDULED, label: 'Schedule for later' },
];

const AUDIENCE_OPTIONS: SelectOption[] = [
  { value: AnnouncementAudienceType.ALL, label: 'Entire company' },
  { value: AnnouncementAudienceType.DEPARTMENTS, label: 'Specific departments' },
  { value: AnnouncementAudienceType.LOCATIONS, label: 'Specific locations' },
  { value: AnnouncementAudienceType.EMPLOYEES, label: 'Specific employees' },
];

const DEFAULT_VALUES: AnnouncementSchemaType = {
  title: '',
  description_html: '',
  priority: AnnouncementPriority.NORMAL,
  publish_type: AnnouncementPublishType.INSTANT,
  scheduled_at: '',
  audience_type: AnnouncementAudienceType.ALL,
  department_ids: [],
  location_ids: [],
  employee_ids: [],
  send_push: true,
  send_email: true,
};

export const CreateAnnouncementModal: React.FC<CreateAnnouncementModalProps> = ({
  isOpen,
  onClose,
  editingAnnouncement,
}) => {
  const { createAnnouncement, isCreating } = useCreateAnnouncement();
  const { updateAnnouncement, isUpdating } = useUpdateAnnouncement();
  const isSaving = isCreating || isUpdating;
  const isEditing = !!editingAnnouncement;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AnnouncementSchemaType>({
    resolver: zodResolver(announcementSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const publishType = useWatch({ control, name: 'publish_type' });

  useEffect(() => {
    if (editingAnnouncement) {
      reset({
        title: editingAnnouncement.title,
        description_html: editingAnnouncement.description_html,
        priority: editingAnnouncement.priority,
        publish_type: editingAnnouncement.publish_type,
        scheduled_at: editingAnnouncement.scheduled_at?.slice(0, 16) ?? '',
        audience_type: editingAnnouncement.audience.type,
        department_ids: editingAnnouncement.audience.department_ids ?? [],
        location_ids: editingAnnouncement.audience.location_ids ?? [],
        employee_ids: editingAnnouncement.audience.employee_ids ?? [],
        send_push: editingAnnouncement.send_push,
        send_email: editingAnnouncement.send_email,
      });
    } else {
      reset(DEFAULT_VALUES);
    }
  }, [editingAnnouncement, reset]);

  const onSubmit: SubmitHandler<AnnouncementSchemaType> = async (data) => {
    const payload = {
      title: data.title,
      description_html: data.description_html,
      priority: data.priority,
      publish_type: data.publish_type,
      scheduled_at:
        data.publish_type === AnnouncementPublishType.SCHEDULED ? data.scheduled_at : undefined,
      audience: {
        type: data.audience_type,
        department_ids: data.department_ids,
        location_ids: data.location_ids,
        employee_ids: data.employee_ids,
      },
      send_push: data.send_push,
      send_email: data.send_email,
    };

    if (isEditing && editingAnnouncement) {
      await updateAnnouncement({ id: editingAnnouncement.id, data: payload });
    } else {
      await createAnnouncement(payload);
    }

    reset(DEFAULT_VALUES);
    onClose();
  };

  const handleClose = () => {
    reset(DEFAULT_VALUES);
    onClose();
  };

  return (
    <Dialog
      title={isEditing ? 'Edit Announcement' : 'Create Announcement'}
      open={isOpen}
      onClose={handleClose}
      maxWidth="640px"
      position="right"
      actions={
        <div className={styles.footer}>
          <Button variant="secondary" onClick={handleClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit(onSubmit)} disabled={isSaving}>
            {isSaving ? 'Saving...' : isEditing ? 'Save changes' : 'Create'}
          </Button>
        </div>
      }
    >
      <div className={styles.body}>
        <Input
          label="Title"
          required
          placeholder="Enter announcement title"
          error={errors.title?.message}
          {...register('title')}
        />

        <div className={styles.field}>
          <label className={styles.label}>
            Description <span className={styles.asterisk}>*</span>
          </label>
          <Controller
            name="description_html"
            control={control}
            render={({ field }) => (
              <div
                className={`${styles.editorWrapper} ${errors.description_html ? styles.hasError : ''}`}
              >
                <MarkdownEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Write your announcement content here..."
                  height={220}
                />
              </div>
            )}
          />
          {errors.description_html && (
            <span className={styles.errorText}>{errors.description_html.message}</span>
          )}
        </div>

        <div className={styles.row}>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <Select
                label="Priority"
                required
                options={PRIORITY_OPTIONS}
                value={field.value}
                onChange={(val) => field.onChange(String(val))}
                error={errors.priority?.message}
              />
            )}
          />

          <Controller
            name="publish_type"
            control={control}
            render={({ field }) => (
              <Select
                label="Publish type"
                required
                options={PUBLISH_TYPE_OPTIONS}
                value={field.value}
                onChange={(val) => field.onChange(String(val))}
                error={errors.publish_type?.message}
              />
            )}
          />
        </div>

        {publishType === AnnouncementPublishType.SCHEDULED && (
          <Input
            label="Schedule date & time"
            required
            type="datetime-local"
            error={errors.scheduled_at?.message}
            {...register('scheduled_at')}
          />
        )}

        <Controller
          name="audience_type"
          control={control}
          render={({ field }) => (
            <Select
              label="Audience"
              required
              options={AUDIENCE_OPTIONS}
              value={field.value}
              onChange={(val) => field.onChange(String(val))}
              error={errors.audience_type?.message}
            />
          )}
        />

        <div className={styles.toggleRow}>
          <div className={styles.toggleInfo}>
            <span className={styles.toggleLabel}>Push notification</span>
            <span className={styles.toggleHint}>Send push alert to mobile devices</span>
          </div>
          <Controller
            name="send_push"
            control={control}
            render={({ field }) => (
              <button
                type="button"
                className={`${styles.toggleBtn} ${field.value ? styles.active : ''}`}
                onClick={() => field.onChange(!field.value)}
              />
            )}
          />
        </div>

        <div className={styles.toggleRow}>
          <div className={styles.toggleInfo}>
            <span className={styles.toggleLabel}>Email notification</span>
            <span className={styles.toggleHint}>Send email to targeted employees</span>
          </div>
          <Controller
            name="send_email"
            control={control}
            render={({ field }) => (
              <button
                type="button"
                className={`${styles.toggleBtn} ${field.value ? styles.active : ''}`}
                onClick={() => field.onChange(!field.value)}
              />
            )}
          />
        </div>
      </div>
    </Dialog>
  );
};
