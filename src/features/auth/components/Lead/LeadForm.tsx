import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Layers } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

import { useSetupCompany } from '../../api/useSetupCompany';
import { useIndustryTypes } from '../../api/useIndustryTypes';
import { AuthFormWrapper } from '../AuthFormWrapper/AuthFormWrapper';
import elementsStyles from '../AuthFormWrapper/AuthFormElements.module.scss';
import { Button } from '../../../../components/ui/Button/Button';
import { Input } from '../../../../components/ui/Input/Input';
import { Select } from '../../../../components/common/Select/Select';
import { persistAuthResponse } from '../../../../utils/cookieUtils';

import styles from './LeadForm.module.scss';

import type { LoginResponse } from '../../api/authType';

type LeadFormData = {
  logo?: FileList;
  industry: string;
  companyName: string;
  workspaceURL: string;
};

// Workspace subdomains are used to build the tenant URL, so they must be a valid
// DNS label: lowercase letters/numbers, single hyphens between segments, no
// leading/trailing hyphen.
const WORKSPACE_URL_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const LeadForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId as string | undefined;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LeadFormData>();
  const logoRegister = register('logo');

  const {
    mutate: setupCompany,
    isPending,
    error: apiError,
  } = useSetupCompany({
    onSuccess: (data: LoginResponse) => {
      persistAuthResponse(data);

      navigate('/auth/welcome');
    },
  });

  const { data: industryTypesResp, isLoading: isIndustryTypesLoading } = useIndustryTypes();
  const industryTypes = industryTypesResp?.data || [];

  // Preview the selected logo. Object URLs are revoked on change/unmount to avoid leaks.
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    logoRegister.onChange(e); // keep react-hook-form in sync
    const file = e.target.files?.[0];
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  };
  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  const onSubmit = (data: LeadFormData) => {
    if (!userId) return;
    setupCompany({
      name: data.companyName,
      subdomain: data.workspaceURL,
      business_type_id: data.industry,
      user_id: userId,
    });
  };

  return (
    <div>
      <AuthFormWrapper
        title="Tell us about your company."
        subtitle="This helps us set up your workspace correctly."
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className={styles.uploadSection}>
          {/* The box itself is the label so clicking anywhere in it opens the file picker. */}
          <label htmlFor="logo-upload" className={styles.uploadBox}>
            {logoPreview ? (
              <img src={logoPreview} alt="Company logo preview" className={styles.uploadPreview} />
            ) : (
              <Layers className={styles.uploadIconPlaceholder} />
            )}
            <input
              type="file"
              accept="image/*"
              className={styles.hiddenInput}
              id="logo-upload"
              {...logoRegister}
              onChange={handleLogoChange}
            />
          </label>
          <label htmlFor="logo-upload" className={styles.uploadLabel}>
            {logoPreview ? 'Change your logo' : 'Click to upload your logo'}
          </label>
        </div>

        <Input
          label="Company name *"
          id="companyName"
          type="text"
          placeholder="Company name"
          {...register('companyName', { required: 'Please enter your company name' })}
          error={errors.companyName?.message}
        />

        <Input
          label="Workspace URL *"
          id="workspaceURL"
          type="text"
          placeholder="your-workspace"
          {...register('workspaceURL', {
            required: 'Please enter your workspace URL',
            pattern: {
              value: WORKSPACE_URL_REGEX,
              message: 'Use lowercase letters, numbers and hyphens only (e.g. acme-inc)',
            },
          })}
          error={errors.workspaceURL?.message}
        />

        <Controller
          name="industry"
          control={control}
          rules={{ required: 'Please select an industry' }}
          render={({ field }) => (
            <Select
              label="Industry / Business Type"
              required
              placeholder={isIndustryTypesLoading ? 'Loading industries...' : 'Select an industry'}
              options={industryTypes.map((industry) => ({
                value: industry.id,
                label: industry.name,
              }))}
              disabled={isIndustryTypesLoading}
              value={field.value}
              onChange={(value) => field.onChange(value)}
              error={errors.industry?.message}
            />
          )}
        />

        {apiError && (
          <span className={elementsStyles.error} style={{ display: 'block', marginBottom: '16px' }}>
            {(apiError as Error)?.message || 'Company setup failed.'}
          </span>
        )}

        <Button type="submit" variant="primary" disabled={isPending}>
          {isPending ? 'Setting up...' : 'Continue'}
        </Button>
      </AuthFormWrapper>
    </div>
  );
};
