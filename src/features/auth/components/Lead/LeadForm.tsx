import React from 'react';
import { useForm } from 'react-hook-form';
import { Layers } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

import { useSetupCompany } from '../../api/useSetupCompany';
import { useIndustryTypes } from '../../api/useIndustryTypes';
import { AuthFormWrapper } from '../AuthFormWrapper/AuthFormWrapper';
import elementsStyles from '../AuthFormWrapper/AuthFormElements.module.scss';
import { Button } from '../../../../components/ui/Button/Button';
import { Input } from '../../../../components/ui/Input/Input';
import { Select } from '../../../../components/ui/Select/Select';
import { setCookie } from '../../../../utils/cookieUtils';

import styles from './LeadForm.module.scss';

import type { LoginResponse } from '../../api/authType';

type LeadFormData = {
  logo?: FileList;
  industry: string;
  companyName: string;
  workspaceURL: string;
};

export const LeadForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId as string | undefined;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormData>();

  const {
    mutate: setupCompany,
    isPending,
    error: apiError,
  } = useSetupCompany({
    onSuccess: (data: LoginResponse) => {
      setCookie('auth_response', JSON.stringify(data));

      navigate('/auth/welcome');
    },
  });

  const { data: industryTypesResp, isLoading: isIndustryTypesLoading } = useIndustryTypes();
  const industryTypes = industryTypesResp?.data || [];

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
        title="Tell us about you company."
        subtitle="This helps us set up workspace correctly."
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className={styles.uploadSection}>
          <div className={styles.uploadBox}>
            <Layers className={styles.uploadIconPlaceholder} />
            <input
              type="file"
              accept="image/*"
              className={styles.hiddenInput}
              id="logo-upload"
              {...register('logo')}
            />
          </div>
          <label htmlFor="logo-upload" className={styles.uploadLabel}>
            Click to upload your logo
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
          placeholder="Workspace URL"
          {...register('workspaceURL', { required: 'Please enter your workspace URL' })}
          error={errors.workspaceURL?.message}
        />

        <Select
          label="Industry / Business Type *"
          id="industry"
          placeholder={isIndustryTypesLoading ? 'Loading industries...' : 'Select an industry'}
          options={industryTypes.map((industry) => ({ value: industry.id, label: industry.name }))}
          disabled={isIndustryTypesLoading}
          {...register('industry', { required: 'Please select an industry' })}
          error={errors.industry?.message}
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
