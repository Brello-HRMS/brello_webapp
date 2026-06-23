import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button, Dialog } from '../../../../components/common';
import { Input } from '../../../../components/ui/Input/Input';
import { letterCategorySchema, type LetterCategoryFormInput } from '../../validation/letterSchemas';

import styles from './CategoryFormModal.module.scss';

import type {
  LetterCategory,
  CreateLetterCategoryParams,
  DocumentType,
  DocumentTypeMeta,
} from '../../types/letterTypes';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (params: CreateLetterCategoryParams) => void;
  editing?: LetterCategory | null;
  isPending?: boolean;
  documentType: DocumentType;
  documentTypeMeta: DocumentTypeMeta;
}

export const CategoryFormModal: React.FC<Props> = ({
  open,
  onClose,
  onSave,
  editing,
  isPending,
  documentType,
  documentTypeMeta,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LetterCategoryFormInput>({
    resolver: zodResolver(letterCategorySchema),
    defaultValues: { name: '', description: '' },
  });

  useEffect(() => {
    if (open) {
      reset({ name: editing?.name ?? '', description: editing?.description ?? '' });
    }
  }, [open, editing, reset]);

  const onSubmit = (data: LetterCategoryFormInput) => {
    onSave({
      name: data.name,
      description: data.description?.trim() || undefined,
      document_type: documentType,
    });
  };

  const title = editing ? 'Edit Category' : `New ${documentTypeMeta.label} Category`;

  return (
    <Dialog open={open} onClose={onClose} title={title} maxWidth="480px" position="right">
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
        <div className={styles.field}>
          <label className={styles.label}>Category Name</label>
          <Input {...register('name')} placeholder="e.g. Proof of Employment" autoFocus />
          {errors.name && <span className={styles.error}>{errors.name.message}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            Description <span className={styles.optional}>(optional)</span>
          </label>
          <Input {...register('description')} placeholder="Brief description of this category" />
          {errors.description && <span className={styles.error}>{errors.description.message}</span>}
        </div>

        <div className={styles.actions}>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isPending}>
            {isPending ? 'Saving…' : editing ? 'Update Category' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
