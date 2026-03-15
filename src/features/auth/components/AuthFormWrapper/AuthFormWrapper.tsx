import React, { type ReactNode, type FormEvent } from 'react';

import styles from './AuthFormWrapper.module.scss';

interface AuthFormWrapperProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onSubmit: (e: FormEvent) => void;
  // showSocials?: boolean;
  // socialDividerText?: string;
}

export const AuthFormWrapper: React.FC<AuthFormWrapperProps> = ({
  title,
  subtitle,
  children,
  onSubmit,
}) => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}

      <form onSubmit={onSubmit} className={styles.form}>
        {children}
      </form>
    </div>
  );
};
