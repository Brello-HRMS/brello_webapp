import React from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Layers } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

import { useSetupCompany } from '../../api/useSetupCompany';
import { useIndustryTypes } from '../../api/useIndustryTypes';
import { AuthFormWrapper } from '../AuthFormWrapper/AuthFormWrapper';
import elementsStyles from '../AuthFormWrapper/AuthFormElements.module.scss';
import { Button } from '../../../../components/ui/Button/Button';

import styles from './LeadForm.module.scss';
// import { Button } from '../../../../../components/ui/Button/Button';

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

  const { mutate: setupCompany, isPending, error: apiError } = useSetupCompany({
    onSuccess: () => {
      navigate('/auth/welcome');
    },
  });

  const { data: industryTypesResp, isLoading: isIndustryTypesLoading } = useIndustryTypes();
  const industryTypes = industryTypesResp?.data || [];

  const onSubmit = (data: LeadFormData) => {
    if (!userId) {
      console.error('User ID is missing');
      return;
    }
    setupCompany({
      name: data.companyName,
      subdomain: data.workspaceURL,
      business_type_id: data.industry,
      user_id: userId,
    });
  };

  return (
    <div>
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        <ArrowLeft className={styles.backIcon} />
        Back
      </button>

      <AuthFormWrapper
        title="Tell us about you company."
        subtitle="This helps us set up workspace correctly."
        onSubmit={handleSubmit(onSubmit)}
        showSocials={false}
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

        <div className={elementsStyles.inputGroup}>
          <label htmlFor="companyName">Company name</label>
          <input
            type="text"
            id="companyName"
            className={elementsStyles.input}
            placeholder="Company name"
            {...register('companyName', { required: 'Please enter your company name' })}
          />
          {errors.companyName && (
            <span className={elementsStyles.error}>{errors.companyName.message}</span>
          )}
        </div>

        <div className={elementsStyles.inputGroup}>
          <label htmlFor="workspaceURL">Workspace URL</label>
          <input
            type="text"
            id="workspaceURL"
            className={elementsStyles.input}
            placeholder="Workspace URL"
            {...register('workspaceURL', { required: 'Please enter your workspace URL' })}
          />
          {errors.workspaceURL && (
            <span className={elementsStyles.error}>{errors.workspaceURL.message}</span>
          )}
        </div>

        <div className={elementsStyles.inputGroup}>
          <label htmlFor="industry">Industry / Business Type</label>
          <select
            id="industry"
            className={elementsStyles.input}
            defaultValue=""
            {...register('industry', { required: 'Please select an industry' })}
            disabled={isIndustryTypesLoading}
          >
            <option value="" disabled>
              {isIndustryTypesLoading ? 'Loading industries...' : 'Select an industry'}
            </option>
            {industryTypes.map((industry) => (
              <option key={industry.id} value={industry.id}>
                {industry.name}
              </option>
            ))}
          </select>
          {errors.industry && (
            <span className={elementsStyles.error}>{errors.industry.message}</span>
          )}
        </div>

        {apiError && (
          <span
            className={elementsStyles.error}
            style={{ display: 'block', marginBottom: '16px' }}
          >
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
