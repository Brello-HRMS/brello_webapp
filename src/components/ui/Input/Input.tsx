import React, { forwardRef } from 'react';

import styles from './Input.module.scss';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, ...props }, ref) => {
    return (
      <div className={`${styles.container} ${error ? styles.hasError : ''}`}>
        {label && (
          <label className={styles.label} htmlFor={props.id || props.name}>
            {label}
          </label>
        )}
        <div className={styles.inputWrapper}>
          {icon && <span className={styles.icon}>{icon}</span>}
          <input
            {...props}
            ref={ref}
            className={`${styles.input} ${icon ? styles.withIcon : ''} ${className || ''}`}
          />
        </div>
        {error && <span className={styles.errorMessage}>{error}</span>}
      </div>
    );
  },
);

Input.displayName = 'Input';
