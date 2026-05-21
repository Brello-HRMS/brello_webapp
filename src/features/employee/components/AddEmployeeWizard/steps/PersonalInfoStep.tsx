/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/incompatible-library */
import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Camera, Info } from 'lucide-react';

import { Input } from '../../../../../components/ui/Input/Input';
import { DatePicker } from '../../../../../components/ui/DatePicker/DatePicker';
import { Button } from '../../../../../components/common';
import { useWizard } from '../WizardContext';
import { useEmployeeWizard } from '../../../hooks/useEmployeeWizard';

import styles from './PersonalInfoStep.module.scss';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  phone: z.string().optional(),
  dob: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface PersonalInfoStepProps {
  onClose: () => void;
}

export const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({ onClose }) => {
  const { employeeId, setEmployeeId, updateFormData, nextStep, formData, isEditMode } = useWizard();
  const { createDraftMutation, updatePersonalMutation } = useEmployeeWizard();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(formData.avatar || null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      email: formData.email || '',
      phone: formData.phone || '',
      dob: formData.dob || '',
      address: formData.address || '',
      emergencyContact: formData.emergencyContact || '',
    },
  });

  // Auto-save to context on change via subscription
  React.useEffect(() => {
    const subscription = watch((value) => {
      updateFormData(value);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateFormData]);

  const onSubmit = (data: FormData) => {
    updateFormData(data);

    if (isEditMode && employeeId) {
      updatePersonalMutation.mutate(
        {
          id: employeeId,
          data: {
            dob: data.dob || undefined,
            presentAddress: data.address || undefined,
          },
        },
        {
          onSuccess: () => {
            nextStep();
          },
        },
      );
      return;
    }

    if (employeeId) {
      nextStep();
      return;
    }

    createDraftMutation.mutate(
      {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
      },
      {
        onSuccess: (response: any) => {
          const newId = response?.data?.id;
          if (newId) {
            setEmployeeId(newId);
          }
          nextStep();
        },
      },
    );
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return; // Silent fail or show toast if available
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        updateFormData({ avatar: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveDraft = () => {
    // Already saved via auto-sync, just close
    onClose();
  };

  const isPending = createDraftMutation.isPending || updatePersonalMutation.isPending;

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <div className={styles.photoUploadContainer} onClick={handlePhotoClick}>
        <div className={styles.photoPlaceholder}>
          {photoPreview ? (
            <img src={photoPreview} alt="Profile Preview" className={styles.previewImage} />
          ) : (
            <Camera size={24} className={styles.cameraIcon} />
          )}
        </div>
        <div className={styles.uploadTextContainer}>
          <p className={styles.uploadTitle}>Click to upload photo</p>
          <p className={styles.uploadSubtitle}>PNG, JPG upto 5MB</p>
        </div>
      </div>

      <div className={styles.row}>
        <Input
          label="First Name"
          required
          placeholder="First name"
          {...register('firstName')}
          error={errors.firstName?.message}
        />
        <Input
          label="Last Name"
          required
          placeholder="Last name"
          {...register('lastName')}
          error={errors.lastName?.message}
        />
      </div>

      <Input
        label="Official Email"
        required
        placeholder="example@company.com"
        {...register('email')}
        error={errors.email?.message}
        className={styles.fullWidth}
        disabled={isEditMode}
      />

      <div className={styles.infoAlert}>
        <div className={styles.infoContent}>
          <Info size={16} className={styles.infoIcon} />
          <span>Only name & email required to save as draft</span>
        </div>
      </div>

      <div className={styles.row}>
        <Controller
          name="dob"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="DOB (Optional)"
              value={field.value}
              onChange={field.onChange}
              error={errors.dob?.message}
            />
          )}
        />
        <Input
          label="Phone (Optional)"
          required={false}
          placeholder="+91"
          {...register('phone')}
          error={errors.phone?.message}
        />
      </div>

      <Input
        label="Address (Optional)"
        required={false}
        placeholder="Street Address, Apt/Suite. City, State, Zip Code"
        {...register('address')}
        error={errors.address?.message}
        className={styles.fullWidth}
      />

      <Input
        label="Emergency Contact (Optional)"
        required={false}
        placeholder="+91"
        {...register('emergencyContact')}
        error={errors.emergencyContact?.message}
        className={styles.fullWidth}
      />

      <div className={styles.actions}>
        <Button
          variant="secondary"
          type="button"
          onClick={isEditMode ? onClose : handleSaveDraft}
          className={styles.saveDraftButton}
          isLoading={isPending}
        >
          {isEditMode ? 'Cancel' : 'Save draft'}
        </Button>
        <Button variant="primary" type="submit" className={styles.nextButton} isLoading={isPending}>
          Next
        </Button>
      </div>
    </form>
  );
};
