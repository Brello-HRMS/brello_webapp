import { useState, useCallback } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MdEditor } from 'md-editor-rt';
import 'md-editor-rt/lib/style.css';
import { Copy, Eye, Pencil } from 'lucide-react';

import { Button, Dialog } from '../../../../components/common';
import { Input } from '../../../../components/ui/Input/Input';
import { showToast } from '../../../ToastFeature/ShowToast';
import {
  letterTemplateSchema,
  type LetterTemplateFormInput,
  type LetterTemplateFormOutput,
} from '../../validation/letterSchemas';
import { LetterPreview } from '../LetterPreview/LetterPreview';
import {
  LETTER_VARIABLES,
  type LetterTemplate,
  type CreateLetterTemplateParams,
  type UpdateLetterTemplateParams,
} from '../../types/letterTypes';

import styles from './TemplateEditorModal.module.scss';

type Mode = 'write' | 'preview';

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (params: CreateLetterTemplateParams | UpdateLetterTemplateParams) => void;
  categoryId: string;
  editing?: LetterTemplate | null;
  isPending?: boolean;
}

function extractVariables(content: string): string[] {
  const matches = content.match(/\{\{([^}]+)\}\}/g) ?? [];
  return [...new Set(matches.map((m) => m.slice(2, -2).trim()))];
}

const TemplateEditorModalInner: React.FC<Omit<Props, 'open'>> = ({
  onClose,
  onSave,
  categoryId,
  editing,
  isPending,
}) => {
  const [mode, setMode] = useState<Mode>('write');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LetterTemplateFormInput, unknown, LetterTemplateFormOutput>({
    resolver: zodResolver(letterTemplateSchema),
    defaultValues: {
      name: editing?.name ?? '',
      subject: editing?.subject ?? '',
      content: editing?.content ?? '',
    },
  });

  const safeContent = useWatch({ control, name: 'content' }) ?? '';
  const watchedName = useWatch({ control, name: 'name' }) ?? '';
  const watchedSubject = useWatch({ control, name: 'subject' }) ?? '';

  const handleCopyVariable = useCallback((varName: string) => {
    navigator.clipboard.writeText(`{{${varName}}}`).then(() => {
      showToast(`Copied {{${varName}}}`, 'success');
    });
  }, []);

  const onSubmit = (data: LetterTemplateFormOutput) => {
    const allText = `${data.subject ?? ''} ${data.content}`;
    const variables = extractVariables(allText);
    if (editing) {
      onSave({
        name: data.name,
        subject: data.subject ?? '',
        content: data.content,
        variables,
      } satisfies UpdateLetterTemplateParams);
    } else {
      onSave({
        category_id: categoryId,
        name: data.name,
        subject: data.subject ?? '',
        content: data.content,
        variables,
      } satisfies CreateLetterTemplateParams);
    }
  };

  const usedVariables = extractVariables(`${watchedSubject} ${safeContent}`);

  return (
    <Dialog
      open={true}
      onClose={onClose}
      title={editing ? 'Edit Template' : 'New Letter Template'}
      maxWidth="960px"
    >
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
        {/* Name + mode tabs row */}
        <div className={styles.nameRow}>
          <div className={styles.field}>
            <label className={styles.label}>Template Name</label>
            <Input {...register('name')} placeholder="e.g. Offer Letter" />
            {errors.name && <span className={styles.error}>{errors.name.message}</span>}
          </div>

          <div className={styles.modeTabs}>
            <button
              type="button"
              className={`${styles.modeTab} ${mode === 'write' ? styles.modeTabActive : ''}`}
              onClick={() => setMode('write')}
            >
              <Pencil size={13} />
              Editor
            </button>
            <button
              type="button"
              className={`${styles.modeTab} ${mode === 'preview' ? styles.modeTabActive : ''}`}
              onClick={() => setMode('preview')}
            >
              <Eye size={13} />
              Letter Preview
            </button>
          </div>
        </div>

        {mode === 'write' && (
          <>
            {/* Subject line */}
            <div className={styles.field}>
              <label className={styles.label}>
                Subject <span className={styles.optional}>(optional — shown in letter)</span>
              </label>
              <Input
                {...register('subject')}
                placeholder="e.g. Employment Offer – {{company_name}}"
              />
              {errors.subject && <span className={styles.error}>{errors.subject.message}</span>}
            </div>

            {/* Variable palette */}
            <div className={styles.varPalette}>
              <span className={styles.varPaletteLabel}>Insert variable:</span>
              <div className={styles.varGroups}>
                {LETTER_VARIABLES.map((group) => (
                  <div key={group.group} className={styles.varGroup}>
                    <span className={styles.varGroupLabel}>{group.group}</span>
                    {group.vars.map((v) => (
                      <button
                        key={v}
                        type="button"
                        className={`${styles.varChip} ${usedVariables.includes(v) ? styles.varChipUsed : ''}`}
                        onClick={() => handleCopyVariable(v)}
                        title={`Copy {{${v}}} to clipboard`}
                      >
                        <Copy size={10} />
                        {v}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Editor */}
            <div className={styles.editorArea}>
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <MdEditor
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    language="en-US"
                    theme="light"
                    preview={false}
                    toolbars={[
                      'bold',
                      'italic',
                      'underline',
                      'strikeThrough',
                      '-',
                      'title',
                      'quote',
                      'unorderedList',
                      'orderedList',
                      '-',
                      'table',
                      'link',
                      '-',
                      'revoke',
                      'next',
                    ]}
                    footers={[]}
                    placeholder="Write your letter template here. Use {{variable_name}} for dynamic fields."
                    style={{ height: '100%', minHeight: 320 }}
                  />
                )}
              />
            </div>

            {/* Detected variables chip row */}
            {usedVariables.length > 0 && (
              <div className={styles.detectedVars}>
                <span className={styles.detectedVarsLabel}>Variables detected:</span>
                {usedVariables.map((v) => (
                  <span key={v} className={styles.detectedVarTag}>{`{{${v}}}`}</span>
                ))}
              </div>
            )}
          </>
        )}

        {mode === 'preview' && (
          <LetterPreview
            name={watchedName || editing?.name || 'Preview'}
            subject={watchedSubject}
            content={safeContent}
            showDownload={false}
          />
        )}

        <div className={styles.actions}>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={isPending}>
            {isPending ? 'Saving…' : editing ? 'Update Template' : 'Create Template'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export const TemplateEditorModal: React.FC<Props> = ({ open, editing, ...props }) => {
  if (!open) return null;
  return <TemplateEditorModalInner key={editing?.id ?? 'new'} editing={editing} {...props} />;
};
