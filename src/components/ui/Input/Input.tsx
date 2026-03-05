import React, { forwardRef } from 'react';

import styles from './Input.module.scss';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className={`${styles.wrapper} ${className || ''}`}>
        {label && (
          <label className={styles.label} htmlFor={props.id || props.name}>
            {label}
            {props.required && <span className={styles.required}>*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          id={props.id || props.name}
          {...props}
        />
        {error && <span className={styles.error}>{error}</span>}
      </div>
    );
  },
);

Input.displayName = 'Input';
