import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Dialog, Button } from '../../../../components/common';
import { Input } from '../../../../components/ui/Input/Input';
import { TextArea } from '../../../../components/ui/TextArea/TextArea';
import { letterCategorySchema } from '../../validation/letterSchemas';
import { useCreateLetterCategory, useUpdateLetterCategory } from '../../hooks/useLetterCategories';

import styles from './CategoryFormModal.module.scss';

import type {
  LetterCategoryFormInput,
  LetterCategoryFormOutput,
} from '../../validation/letterSchemas';
import type { LetterCategory } from '../../types/letterTypes';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: LetterCategory | null;
}

const initialFormValues: LetterCategoryFormInput = {
  name: '',
  description: '',
};

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({
  isOpen,
  onClose,
  category,
}) => {
  const { mutate: createCategory, isPending: isCreating } = useCreateLetterCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateLetterCategory();

  const isPending = isCreating || isUpdating;
  const isEdit = !!category;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LetterCategoryFormInput>({
    resolver: zodResolver(letterCategorySchema),
    defaultValues: initialFormValues,
  });

  useEffect(() => {
    if (isOpen) {
      if (category) {
        reset({
          name: category.name,
          description: category.description || '',
        });
      } else {
        reset(initialFormValues);
      }
    }
  }, [isOpen, category, reset]);

  const onSubmit = (data: LetterCategoryFormOutput) => {
    const payload = {
      name: data.name,
      description: data.description || undefined,
    };

    if (isEdit && category) {
      updateCategory(
        { id: category.id, params: payload },
        {
          onSuccess: () => onClose(),
        },
      );
    } else {
      createCategory(payload, {
        onSuccess: () => onClose(),
      });
    }
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
        {isEdit ? 'Save changes' : 'Create category'}
      </Button>
    </div>
  );

  return (
    <Dialog
      title={isEdit ? 'Edit Category' : 'Add New Category'}
      open={isOpen}
      onClose={onClose}
      actions={actions}
      maxWidth="500px"
      position="right"
    >
      <form className={styles.formContainer} onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.formGroup}>
          <Input
            label="Category Name"
            required
            placeholder="e.g., Offer Letters"
            {...register('name')}
            error={errors.name?.message}
          />
        </div>

        <div className={styles.formGroup}>
          <TextArea
            label="Description"
            placeholder="Enter a short description for this category"
            {...register('description')}
            error={errors.description?.message}
          />
        </div>
      </form>
    </Dialog>
  );
};
