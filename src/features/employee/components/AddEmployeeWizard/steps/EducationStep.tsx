import React, { useState } from 'react';
import { Plus, MoreVertical } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Input } from '../../../../../components/ui/Input/Input';
import { DatePicker } from '../../../../../components/ui/DatePicker/DatePicker';
import { Button } from '../../../../../components/common';
import { useWizard } from '../WizardContext';
import { useEmployeeWizard } from '../../../hooks/useEmployeeWizard';

import styles from './EducationStep.module.scss';

const schema = z.object({
  schoolName: z.string().min(1, 'School/University is required'),
  degree: z.string().min(1, 'Degree is required'),
  fieldOfStudy: z.string().min(1, 'Field of study is required'),
  completionDate: z.string().min(1, 'Completion date is required'),
  completionYear: z.string().min(1, 'Completion year is required'),
});

type EducationFormData = z.infer<typeof schema>;

interface EducationEntry extends EducationFormData {
  id: string;
}

interface EducationStepProps {
  onClose: () => void;
}

export const EducationStep: React.FC<EducationStepProps> = ({ onClose }) => {
  const { employeeId, formData, updateFormData, nextStep } = useWizard();
  const { educationMutation } = useEmployeeWizard();
  const [educationList, setEducationList] = useState<EducationEntry[]>(
    formData.educationList || [],
  );
  const [isAdding, setIsAdding] = useState(false);

  // Auto-save list to context
  React.useEffect(() => {
    updateFormData({ educationList });
  }, [educationList, updateFormData]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EducationFormData>({
    resolver: zodResolver(schema),
  });

  const handleAddEducation = (data: EducationFormData) => {
    if (!employeeId) return;

    educationMutation.mutate(
      { id: employeeId, data },
      {
        onSuccess: () => {
          setEducationList((prev) => [
            ...prev,
            { ...data, id: Math.random().toString(36).substr(2, 9) },
          ]);
          setIsAdding(false);
          reset();
        },
      },
    );
  };

  const removeEducation = (id: string) => {
    setEducationList((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className={styles.container}>
      {!isAdding && (
        <div className={styles.listSection}>
          {educationList.length > 0 && (
            <div className={styles.educationList}>
              {educationList.map((edu, index) => (
                <div key={edu.id} className={styles.educationCard}>
                  <div className={styles.eduHeader}>
                    <h4 className={styles.eduTitle}>Education {index + 1}</h4>
                    <button
                      className={styles.menuBtn}
                      onClick={() => removeEducation(edu.id)}
                      title="More Options"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                  <div className={styles.eduGrid}>
                    <div className={styles.eduGridItem}>
                      <span className={styles.eduGridLabel}>SCHOOL/COLLEGE</span>
                      <span className={styles.eduGridValue}>{edu.schoolName}</span>
                    </div>
                    <div className={styles.eduGridItem}>
                      <span className={styles.eduGridLabel}>DEGREE</span>
                      <span className={styles.eduGridValue}>{edu.degree}</span>
                    </div>
                    <div className={styles.eduGridItem}>
                      <span className={styles.eduGridLabel}>FIELD</span>
                      <span className={styles.eduGridValue}>{edu.fieldOfStudy}</span>
                    </div>
                    <div className={styles.eduGridItem}>
                      <span className={styles.eduGridLabel}>YEAR</span>
                      <span className={styles.eduGridValue}>{edu.completionYear}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className={styles.ctaCard} onClick={() => setIsAdding(true)}>
            <div className={styles.ctaIconWrapper}>
              <Plus size={24} className={styles.ctaIcon} />
            </div>
            <h4 className={styles.ctaTitle}>Add Education</h4>
            <p className={styles.ctaSubtitle}>
              Add school, degree, and year to complete this section.
            </p>
          </div>
        </div>
      )}

      {isAdding && (
        <form className={styles.form} onSubmit={handleSubmit(handleAddEducation)}>
          <div className={styles.formHeader}>
            <h3 className={styles.formTitle}>Add Education</h3>
          </div>

          <Input
            label="University / School"
            required
            placeholder="Enter school name"
            {...register('schoolName')}
            error={errors.schoolName?.message}
          />

          <Input
            label="Degree"
            required
            placeholder="e.g. Bachelor of Technology"
            {...register('degree')}
            error={errors.degree?.message}
          />

          <Input
            label="Field of Study"
            required
            placeholder="e.g. Computer Science"
            {...register('fieldOfStudy')}
            error={errors.fieldOfStudy?.message}
          />

          <div className={styles.row}>
            <Controller
              name="completionDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  label="Completion Date"
                  required
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.completionDate?.message}
                />
              )}
            />
            <Input
              label="Completion Year"
              required
              placeholder="YYYY"
              {...register('completionYear')}
              error={errors.completionYear?.message}
            />
          </div>

          <div className={styles.formActions}>
            <Button variant="secondary" type="button" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={educationMutation.isPending}>
              Save Education
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
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
