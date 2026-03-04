import React from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { AuthFormWrapper } from '../AuthFormWrapper/AuthFormWrapper';
import elementsStyles from '../AuthFormWrapper/AuthFormElements.module.scss';
import { Button } from '../../../../components/ui/Button/Button';

import styles from './LeadForm.module.scss';
// import { Button } from '../../../../../components/ui/Button/Button';

type LeadFormData = {
  logo?: FileList;
  industry: string;
};

export const LeadForm: React.FC = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormData>();

  const onSubmit = () => {
    navigate('/auth/welcome');
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
          <select
            id="industry"
            className={elementsStyles.input}
            defaultValue=""
            {...register('industry', { required: 'Please select an industry' })}
          >
            <option value="" disabled>
              Select an industry
            </option>
            <option value="tech">
              Technology & IT Companies (Software, SaaS, Startups, IT Services)
            </option>
            <option value="manufacturing">
              Manufacturing & Industrial Business (Factories, Production Units, Automotive)
            </option>
            <option value="retail">
              Retail & E-commerce Businesses (Stores, Online Brands, Multi-location Retail)
            </option>
            <option value="healthcare">
              Healthcare Organizations (Hospitals, Clinics, Pharma, Labs)
            </option>
            <option value="service">
              Service-Based Companies (Consulting, Agencies, Legal, Finance)
            </option>
          </select>
          {errors.industry && (
            <span className={elementsStyles.error}>{errors.industry.message}</span>
          )}
        </div>

        <Button type="submit" variant="primary">
          Continue
        </Button>
      </AuthFormWrapper>
    </div>
  );
};
