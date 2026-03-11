import React, { type ReactNode } from 'react';

import { ArrowLeft, Layers } from 'lucide-react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import onboardingIllustration from '../../../../assets/Onboarding illustration 2.svg';

import styles from './AuthLayout.module.scss';

interface AuthLayoutProps {
  children?: ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const showBackButton = ['/auth/otp', '/auth/lead'].includes(location.pathname);

  return (
    <div className={styles.container}>
      {/* Left side artistic background */}
      <div className={styles.leftPanel}>
        <img
          src={onboardingIllustration}
          alt="Background illustration"
          className={styles.illustration}
        />
      </div>

      {/* Right side form area */}
      <div className={styles.rightPanel}>
        <div className={styles.formContent}>
          {showBackButton && (
            <button className={styles.backButton} onClick={() => navigate(-1)}>
              <ArrowLeft size={16} className={styles.backIcon} />
              Back
            </button>
          )}
          <div className={styles.logoWrapper}>
            <Layers className={styles.logoIcon} />
            <span className={styles.logoText}>Layers</span>
          </div>
          {children || <Outlet />}
        </div>
      </div>
    </div>
  );
};
