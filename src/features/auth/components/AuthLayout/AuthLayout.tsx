import React, { type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';

import styles from './AuthLayout.module.scss';
// import { Layers } from 'lucide-react';

interface AuthLayoutProps {
  children?: ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className={styles.container}>
      {/* Left side artistic background */}
      <div className={styles.leftPanel}>
        {/* <div className={styles.shapeGroup}>
                    <div className={styles.purpleCircleTop} />
                    <div className={styles.tealQuarter} />
                    <div className={styles.lightPurplePetal} />
                    <div className={styles.darkGreenCorner} />
                    <div className={styles.purpleHalfBottom} />
                    <div className={styles.whiteGlow} />
                </div> */}
      </div>

      {/* Right side form area */}
      <div className={styles.rightPanel}>
        <div className={styles.formContent}>
          <div className={styles.logoWrapper}>
            {/* <Layers className={styles.logoIcon} /> */}
            {/* <span className={styles.logoText}>Layers</span> */}
          </div>
          {children || <Outlet />}
        </div>
      </div>
    </div>
  );
};
