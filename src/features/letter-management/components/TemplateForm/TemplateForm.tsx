import React, { useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';

import { Button, Checkbox, Select } from '../../../../components/common';
import { Input } from '../../../../components/ui/Input/Input';
import { TextArea } from '../../../../components/ui/TextArea/TextArea';
import { InsertVariableDropdown } from '../InsertVariableDropdown/InsertVariableDropdown';
import { letterTemplateSchema } from '../../validation/letterSchemas';
import { useLetterCategories } from '../../hooks/useLetterCategories';
import { useSignatories } from '../../hooks/useSignatories';
import { useCreateLetterTemplate, useUpdateLetterTemplate } from '../../hooks/useLetterTemplates';

import styles from './TemplateForm.module.scss';

import type { LetterTemplateFormInput } from '../../validation/letterSchemas';
import type { LetterTemplate } from '../../types/letterTypes';

export interface TemplateFormProps {
  template?: LetterTemplate;
  onSaved?: (template: LetterTemplate) => void;
  // Optional hook for the surrounding page to get live-as-you-type form values
  // (used to drive TemplateLivePreview without lifting the whole useForm()
  // instance out of this component — see TemplateEditorPage).
  onValuesChange?: (values: LetterTemplateFormInput) => void;
}

const buildDefaultValues = (template?: LetterTemplate): LetterTemplateFormInput => ({
  category_id: template?.category_id || '',
  name: template?.name || '',
  heading: template?.heading || '',
  paragraphs: template?.paragraphs?.length ? [...template.paragraphs] : [],
  bullet_list: template?.bullet_list?.length ? [...template.bullet_list] : [],
  include_salary_table: template?.include_salary_table || false,
  signatory_id: template?.signatory_id || '',
});

export const TemplateForm: React.FC<TemplateFormProps> = ({
  template,
  onSaved,
  onValuesChange,
}) => {
  const isEdit = !!template;

  const { data: categoriesResponse } = useLetterCategories();
  const { data: signatoriesResponse } = useSignatories();

  const categoryOptions = (categoriesResponse?.data || [])
    .filter((category) => category.status !== 'ARCHIVED')
    .map((category) => ({ label: category.name, value: category.id }));

  const signatoryOptions = (signatoriesResponse?.data || [])
    .filter((signatory) => signatory.status !== 'ARCHIVED')
    .map((signatory) => ({
      label: `${signatory.name} (${signatory.designation})`,
      value: signatory.id,
    }));

  const { mutate: createTemplate, isPending: isCreating } = useCreateLetterTemplate();
  const { mutate: updateTemplate, isPending: isUpdating } = useUpdateLetterTemplate();
  const isPending = isCreating || isUpdating;

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<LetterTemplateFormInput>({
    resolver: zodResolver(letterTemplateSchema),
    defaultValues: buildDefaultValues(template),
  });

  useEffect(() => {
    reset(buildDefaultValues(template));
    // Only re-sync when switching which template is being edited, not on every
    // template object identity change (e.g. after a save's cache refetch).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template?.id]);

  const paragraphs = useWatch({ control, name: 'paragraphs' }) || [];
  const bulletList = useWatch({ control, name: 'bullet_list' }) || [];
  const watchedValues = useWatch({ control });

  useEffect(() => {
    onValuesChange?.(watchedValues as LetterTemplateFormInput);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(watchedValues)]);

  const handleHeadingInsert = (key: string) => {
    const current = getValues('heading') || '';
    setValue('heading', `${current}{{${key}}}`, { shouldDirty: true });
  };

  const handleParagraphInsert = (index: number, key: string) => {
    const next = [...paragraphs];
    next[index] = `${next[index] || ''}{{${key}}}`;
    setValue('paragraphs', next, { shouldDirty: true });
  };

  const handleBulletInsert = (index: number, key: string) => {
    const next = [...bulletList];
    next[index] = `${next[index] || ''}{{${key}}}`;
    setValue('bullet_list', next, { shouldDirty: true });
  };

  const addParagraph = () => setValue('paragraphs', [...paragraphs, ''], { shouldDirty: true });
  const removeParagraph = (index: number) =>
    setValue(
      'paragraphs',
      paragraphs.filter((_, i) => i !== index),
      { shouldDirty: true },
    );

  const addBullet = () => setValue('bullet_list', [...bulletList, ''], { shouldDirty: true });
  const removeBullet = (index: number) =>
    setValue(
      'bullet_list',
      bulletList.filter((_, i) => i !== index),
      { shouldDirty: true },
    );

  // Note: RHF's handleSubmit types the callback argument as the form's input
  // type (LetterTemplateFormInput), not the zod resolver's output type — the
  // resolver still runs validation/defaulting at submit time, this annotation
  // just matches what handleSubmit actually hands us.
  const onSubmit = (data: LetterTemplateFormInput) => {
    const payload = {
      category_id: data.category_id,
      name: data.name,
      heading: data.heading || undefined,
      paragraphs: (data.paragraphs || []).filter((p) => p.trim() !== ''),
      bullet_list: (data.bullet_list || []).filter((b) => b.trim() !== ''),
      include_salary_table: data.include_salary_table,
      signatory_id: data.signatory_id || undefined,
    };

    if (isEdit && template) {
      updateTemplate(
        { id: template.id, params: payload },
        { onSuccess: (response) => onSaved?.(response.data) },
      );
    } else {
      createTemplate(payload, { onSuccess: (response) => onSaved?.(response.data) });
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.formGroup}>
        <Controller
          name="category_id"
          control={control}
          render={({ field }) => (
            <Select
              label="Category"
              required
              placeholder="Select a category"
              options={categoryOptions}
              value={field.value}
              onChange={(val) => field.onChange(String(val))}
              error={errors.category_id?.message}
            />
          )}
        />
      </div>

      <div className={styles.formGroup}>
        <Input
          label="Template Name"
          required
          placeholder="e.g., Standard Offer Letter"
          {...register('name')}
          error={errors.name?.message}
        />
      </div>

      <div className={styles.formGroup}>
        <div className={styles.labelRow}>
          <label className={styles.label}>Heading</label>
          <InsertVariableDropdown onInsert={handleHeadingInsert} />
        </div>
        <Input
          placeholder="e.g., Offer of Employment"
          {...register('heading')}
          error={errors.heading?.message}
        />
      </div>

      <div className={styles.formGroup}>
        <div className={styles.labelRow}>
          <label className={styles.label}>Paragraphs</label>
          <Button type="button" variant="secondary" size="sm" onClick={addParagraph}>
            <Plus size={14} />
            Add Paragraph
          </Button>
        </div>
        {paragraphs.length === 0 && <p className={styles.mutedText}>No paragraphs added yet.</p>}
        {paragraphs.map((paragraph, index) => (
          <div key={index} className={styles.repeatableRow}>
            <div className={styles.repeatableRowHeader}>
              <span className={styles.rowIndex}>Paragraph {index + 1}</span>
              <div className={styles.rowActions}>
                <InsertVariableDropdown onInsert={(key) => handleParagraphInsert(index, key)} />
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => removeParagraph(index)}
                  title="Remove paragraph"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <TextArea
              value={paragraph}
              onChange={(e) => {
                const next = [...paragraphs];
                next[index] = e.target.value;
                setValue('paragraphs', next, { shouldDirty: true });
              }}
            />
          </div>
        ))}
      </div>

      <div className={styles.formGroup}>
        <div className={styles.labelRow}>
          <label className={styles.label}>Bullet List</label>
          <Button type="button" variant="secondary" size="sm" onClick={addBullet}>
            <Plus size={14} />
            Add Bullet
          </Button>
        </div>
        {bulletList.length === 0 && <p className={styles.mutedText}>No bullet points added yet.</p>}
        {bulletList.map((bullet, index) => (
          <div key={index} className={styles.repeatableRow}>
            <div className={styles.repeatableRowHeader}>
              <span className={styles.rowIndex}>Bullet {index + 1}</span>
              <div className={styles.rowActions}>
                <InsertVariableDropdown onInsert={(key) => handleBulletInsert(index, key)} />
                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => removeBullet(index)}
                  title="Remove bullet"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <TextArea
              value={bullet}
              onChange={(e) => {
                const next = [...bulletList];
                next[index] = e.target.value;
                setValue('bullet_list', next, { shouldDirty: true });
              }}
            />
          </div>
        ))}
      </div>

      <div className={styles.formGroup}>
        <Controller
          name="include_salary_table"
          control={control}
          render={({ field }) => (
            <Checkbox
              label="Include Salary Table"
              checked={!!field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
          )}
        />
      </div>

      <div className={styles.formGroup}>
        <Controller
          name="signatory_id"
          control={control}
          render={({ field }) => (
            <Select
              label="Signatory"
              placeholder="Select a signatory (optional)"
              options={signatoryOptions}
              value={field.value}
              onChange={(val) => field.onChange(String(val))}
              error={errors.signatory_id?.message}
            />
          )}
        />
      </div>

      <div className={styles.formActions}>
        <Button type="submit" variant="primary" isLoading={isPending}>
          {isEdit ? 'Save Changes' : 'Create Template'}
        </Button>
      </div>
    </form>
  );
};
