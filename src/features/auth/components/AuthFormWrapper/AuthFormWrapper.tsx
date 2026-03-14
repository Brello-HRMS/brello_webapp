import React, { type ReactNode, type FormEvent } from 'react';

import styles from './AuthFormWrapper.module.scss';

interface AuthFormWrapperProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onSubmit: (e: FormEvent) => void;
  showSocials?: boolean;
  socialDividerText?: string;
}

export const AuthFormWrapper: React.FC<AuthFormWrapperProps> = ({
  title,
  subtitle,
  children,
  onSubmit,
  // showSocials = true,
  // socialDividerText = 'Or register with',
}) => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}

      <form onSubmit={onSubmit} className={styles.form}>
        {children}
      </form>

      {/* {showSocials && (
        <>
          <div className={styles.divider}>
            <span className={styles.dividerText}>{socialDividerText}</span>
          </div>

          <div className={styles.socialButtons}>
            <button type="button" className={styles.socialBtn}>
              Google
            </button>
            <button type="button" className={styles.socialBtn}>
              Apple
            </button>
          </div>
        </>
      )} */}
    </div>
  );
};
