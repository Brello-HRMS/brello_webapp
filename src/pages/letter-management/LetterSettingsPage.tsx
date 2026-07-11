import React, { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Input } from '../../components/ui/Input/Input';
import { Button } from '../../components/ui/Button/Button';
import { Select } from '../../components/common/Select/Select';
import { useModuleAccess } from '../../hooks/useModuleAccess';
import { ModuleCode } from '../../enum/modules';
import {
  useLetterSettings,
  useUpdateLetterSettings,
} from '../../features/letter-management/hooks/useLetterSettings';
import { useSignatories } from '../../features/letter-management/hooks/useSignatories';
import {
  letterSettingsSchema,
  type LetterSettingsFormInput,
  type LetterSettingsFormOutput,
} from '../../features/letter-management/validation/letterSchemas';

import styles from './LetterSettingsPage.module.scss';

import type { SelectOption } from '../../components/common/Select/Select';
import type { Signatory } from '../../features/letter-management/types/letterTypes';

interface LetterSettingsPageProps {
  setHeaderActions: (actions: React.ReactNode) => void;
}

const LetterSettingsPage: React.FC<LetterSettingsPageProps> = ({ setHeaderActions }) => {
  const { data: response, isLoading } = useLetterSettings();
  const { mutate: updateSettings, isPending: isSaving } = useUpdateLetterSettings();
  const { data: signatoriesResponse } = useSignatories();
  const { hasEditAccess } = useModuleAccess(ModuleCode.LETTER_TEMPLATES);

  const settings = response?.data;
  const signatories: Signatory[] = signatoriesResponse?.data || [];

  const signatoryOptions: SelectOption[] = signatories.map((s) => ({
    label: `${s.name} — ${s.designation}`,
    value: s.id,
  }));

  const defaultValues: LetterSettingsFormInput = useMemo(
    () => ({
      letter_prefix: '',
      default_signatory_id: '',
      date_format: '',
    }),
    [],
  );

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LetterSettingsFormInput>({
    resolver: zodResolver(letterSettingsSchema),
    defaultValues,
  });

  useEffect(() => {
    if (settings) {
      reset({
        letter_prefix: settings.letter_prefix || '',
        default_signatory_id: settings.default_signatory_id || '',
        date_format: settings.date_format || '',
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: LetterSettingsFormOutput) => {
    updateSettings({
      letter_prefix: data.letter_prefix,
      default_signatory_id: data.default_signatory_id || undefined,
      date_format: data.date_format,
    });
  };

  const isDisabled = !hasEditAccess || isLoading;

  useEffect(() => {
    setHeaderActions(
      hasEditAccess ? (
        <Button
          variant="primary"
          type="submit"
          form="letter-settings-form"
          isLoading={isSaving}
          disabled={isLoading}
        >
          Save
        </Button>
      ) : undefined,
    );
  }, [setHeaderActions, hasEditAccess, isSaving, isLoading]);

  return (
    <div className={styles.container}>
      <form id="letter-settings-form" onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h3>Numbering & Format</h3>
          </div>
          <div className={styles.content}>
            <Input
              label="Letter Prefix"
              placeholder="e.g., HR"
              required
              error={errors.letter_prefix?.message}
              disabled={isDisabled}
              {...register('letter_prefix')}
            />

            <Input
              label="Date Format"
              placeholder="e.g., DD MMM YYYY"
              required
              error={errors.date_format?.message}
              disabled={isDisabled}
              {...register('date_format')}
            />

            <Controller
              name="default_signatory_id"
              control={control}
              render={({ field }) => (
                <Select
                  label="Default Signatory"
                  placeholder="Select a signatory"
                  options={signatoryOptions}
                  value={field.value || ''}
                  onChange={(value) => field.onChange(String(value))}
                  error={errors.default_signatory_id?.message}
                  disabled={isDisabled}
                />
              )}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default LetterSettingsPage;
