import React, { useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { Layers } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useSetupCompany } from '../../api/useSetupCompany';
import { useIndustryTypes } from '../../api/useIndustryTypes';
import { AuthFormWrapper } from '../AuthFormWrapper/AuthFormWrapper';
import { Button } from '../../../../components/ui/Button/Button';
import { Input } from '../../../../components/ui/Input/Input';
import { Select } from '../../../../components/common';

import styles from './LeadForm.module.scss';

import type { LoginResponse } from '../../api/authType';

type LeadFormData = {
  logo?: FileList;
  industry: string;
  companyName: string;
  workspaceURL?: string;
  websiteUrl: string;
};

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

  const logo = useWatch({ control, name: 'logo' });
  const imgRef = React.useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (logo && logo.length > 0) {
      const file = logo[0];
      const url = URL.createObjectURL(file);
      if (imgRef.current) {
        imgRef.current.src = url;
      }
      return () => URL.revokeObjectURL(url);
    }
  }, [logo]);

  const { mutate: setupCompany, isPending } = useSetupCompany({
    onSuccess: (data: LoginResponse) => {
      sessionStorage.setItem('auth_response', JSON.stringify(data));

      navigate('/auth/welcome');
    },
    onError: (error) => {
      toast.error((error as Error)?.message || 'Company setup failed.');
    },
  });

  const { data: industryTypesResp, isLoading: isIndustryTypesLoading } = useIndustryTypes();
  const industryTypes = industryTypesResp?.data || [];

  const onSubmit = (data: LeadFormData) => {
    if (!userId) return;

    setupCompany({
      name: data.companyName,
      subdomain: data.workspaceURL || undefined,
      website_url: data.websiteUrl,
      business_type_id: data.industry,
      user_id: userId,
      logo: data.logo && data.logo.length > 0 ? data.logo[0] : undefined,
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
            {logo && logo.length > 0 ? (
              <img
                ref={imgRef}
                alt="Logo preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  borderRadius: 'inherit',
                }}
              />
            ) : (
              <Layers className={styles.uploadIconPlaceholder} />
            )}
            <input
              type="file"
              accept="image/*"
              className={styles.hiddenInput}
              id="logo-upload"
              {...register('logo')}
            />
          </div>
          <label htmlFor="logo-upload" className={styles.uploadLabel}>
            {logo && logo.length > 0 ? 'Change logo' : 'Click to upload your logo'}
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
          label="Website URL *"
          id="websiteUrl"
          type="text"
          placeholder="e.g. brello.com"
          {...register('websiteUrl', { required: 'Please enter your website URL' })}
          error={errors.websiteUrl?.message}
        />

        <Controller
          name="industry"
          control={control}
          rules={{ required: 'Please select an industry' }}
          render={({ field }) => (
            <Select
              label="Industry / Business Type *"
              placeholder={isIndustryTypesLoading ? 'Loading industries...' : 'Select an industry'}
              options={industryTypes.map((industry) => ({
                value: industry.id,
                label: industry.name,
              }))}
              disabled={isIndustryTypesLoading}
              value={field.value}
              onChange={field.onChange}
              error={errors.industry?.message}
            />
          )}
        />

        <Button type="submit" variant="primary" disabled={isPending}>
          {isPending ? 'Setting up...' : 'Continue'}
        </Button>
      </AuthFormWrapper>
    </div>
  );
};
