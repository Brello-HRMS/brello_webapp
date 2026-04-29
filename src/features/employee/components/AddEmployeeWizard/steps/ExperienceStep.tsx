/* eslint-disable react-hooks/incompatible-library */
import React, { useState } from 'react';
import { Plus, MoreVertical } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Input } from '../../../../../components/ui/Input/Input';
import { Button } from '../../../../../components/common';
import { useWizard } from '../WizardContext';
import { useEmployeeWizard } from '../../../hooks/useEmployeeWizard';

import styles from './ExperienceStep.module.scss';

const schema = z
  .object({
    company: z.string().min(1, 'Company name is required'),
    designation: z.string().min(1, 'Designation is required'),
    fromDate: z.string().min(1, 'From date is required'),
    toDate: z.string().optional(),
    isCurrent: z.boolean(),
    description: z.string().optional(),
  })
  .refine((data) => data.isCurrent || (data.toDate && data.toDate.trim().length > 0), {
    message: 'To date is required if not currently working here',
    path: ['toDate'],
  });

type ExperienceFormData = z.infer<typeof schema>;

interface ExperienceEntry extends ExperienceFormData {
  id: string;
}

interface ExperienceStepProps {
  onClose: () => void;
}

export const ExperienceStep: React.FC<ExperienceStepProps> = ({ onClose }) => {
  const { employeeId, formData, updateFormData, nextStep } = useWizard();
  const { experienceMutation } = useEmployeeWizard();
  const [experienceList, setExperienceList] = useState<ExperienceEntry[]>(
    formData.experienceList || [],
  );
  const [isAdding, setIsAdding] = useState(false);

  // Auto-save list to context
  React.useEffect(() => {
    updateFormData({ experienceList });
  }, [experienceList, updateFormData]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<ExperienceFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      isCurrent: false,
    },
  });

  const isCurrent = watch('isCurrent');

  const handleAddExperience = (data: ExperienceFormData) => {
    if (!employeeId) return;

    const payload = { ...data };
    // API throws "invalid ISO 8601" if an empty string is passed for toDate. Let's delete it if isCurrent is true or if it's completely empty.
    if (payload.isCurrent || !payload.toDate?.trim()) {
      delete payload.toDate;
    }

    experienceMutation.mutate(
      { id: employeeId, data: payload },
      {
        onSuccess: () => {
          setExperienceList((prev) => [
            ...prev,
            { ...data, id: Math.random().toString(36).substr(2, 9) },
          ]);
          setIsAdding(false);
          reset();
        },
      },
    );
  };

  const removeExperience = (id: string) => {
    setExperienceList((prev) => prev.filter((e) => e.id !== id));
  };

  const formatDisplayDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return dateString; // fallback
    }
  };

  return (
    <div className={styles.container}>
      {!isAdding && (
        <div className={styles.listSection}>
          {experienceList.length > 0 && (
            <div className={styles.experienceList}>
              {experienceList.map((exp) => (
                <div key={exp.id} className={styles.experienceCard}>
                  <div className={styles.expHeader}>
                    <div className={styles.expHeaderContent}>
                      <h4 className={styles.expCompany}>{exp.company}</h4>
                      <p className={styles.expDesignation}>
                        {exp.designation} <span className={styles.expSeparator}>•</span>{' '}
                        {formatDisplayDate(exp.fromDate)} -{' '}
                        {exp.isCurrent ? 'Present' : formatDisplayDate(exp.toDate)}
                      </p>
                    </div>
                    <button
                      className={styles.menuBtn}
                      onClick={() => removeExperience(exp.id)}
                      title="More Options"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                  {exp.description && (
                    <div className={styles.expDescriptionBox}>
                      <p className={styles.expDescriptionText}>{exp.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className={styles.ctaCard} onClick={() => setIsAdding(true)}>
            <div className={styles.ctaIconWrapper}>
              <Plus size={24} className={styles.ctaIcon} />
            </div>
            <h4 className={styles.ctaTitle}>Add Experience</h4>
            <p className={styles.ctaSubtitle}>
              Include company name, role, duration, and a brief description of your work.
            </p>
          </div>
        </div>
      )}

      {isAdding && (
        <form className={styles.form} onSubmit={handleSubmit(handleAddExperience)}>
          <div className={styles.formHeader}>
            <h3 className={styles.formTitle}>Add Experience</h3>
          </div>

          <Input
            label="Company Name"
            required
            placeholder="e.g. Google"
            {...register('company')}
            error={errors.company?.message}
          />

          <Input
            label="Designation"
            required
            placeholder="e.g. Software Engineer"
            {...register('designation')}
            error={errors.designation?.message}
          />

          <div className={styles.row}>
            <Input
              label="From Date"
              type="date"
              required
              {...register('fromDate')}
              error={errors.fromDate?.message}
            />
            {!isCurrent && (
              <Input
                label="To Date"
                type="date"
                required
                {...register('toDate')}
                error={errors.toDate?.message}
              />
            )}
          </div>

          <div className={styles.checkboxContainer}>
            <input
              type="checkbox"
              id="isCurrent"
              {...register('isCurrent')}
              className={styles.checkbox}
            />
            <label htmlFor="isCurrent" className={styles.checkboxLabel}>
              I currently work here
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description (Optional)</label>
            <textarea
              className={styles.textarea}
              placeholder="Briefly describe your role and achievements"
              {...register('description')}
            />
          </div>

          <div className={styles.formActions}>
            <Button variant="secondary" type="button" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={experienceMutation.isPending}>
              Save Experience
            </Button>
          </div>
        </form>
      )}

      {!isAdding && (
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose} className={styles.saveDraftButton}>
            Save draft
          </Button>
          <Button variant="primary" onClick={nextStep} className={styles.nextButton}>
            Send invite
          </Button>
        </div>
      )}
    </div>
  );
};
