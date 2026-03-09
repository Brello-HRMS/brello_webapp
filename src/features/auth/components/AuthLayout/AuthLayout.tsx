import React, { type ReactNode } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Layers } from 'lucide-react';

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
        <div className={styles.shapeGroup}>
          <div className={styles.purpleCircleTop} />
          <div className={styles.tealQuarter} />
          <div className={styles.lightPurplePetal} />
          <div className={styles.darkGreenCorner} />
          <div className={styles.purpleHalfBottom} />
          <div className={styles.whiteGlow} />
        </div>
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
