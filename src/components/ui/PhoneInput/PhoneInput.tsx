import React, { forwardRef } from 'react';

import styles from './PhoneInput.module.scss';

export interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  countryCode?: string;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ label, error, countryCode = '+91', className, ...props }, ref) => {
    return (
      <div className={`${styles.container} ${error ? styles.hasError : ''}`}>
        {label && (
          <label className={styles.label} htmlFor={props.id || props.name}>
            {label.includes('*') ? (
              <>
                {label.replace('*', '')}
                <span className={styles.asterisk}>*</span>
              </>
            ) : (
              label
            )}
          </label>
        )}
        <div className={styles.inputWrapper}>
          <div className={styles.prefix}>{countryCode}</div>
          <input
            type="tel"
            {...props}
            ref={ref}
            onChange={(e) => {
              e.target.value = e.target.value.replace(/\D/g, '');
              props.onChange?.(e);
            }}
            className={`${styles.input} ${className || ''}`}
          />
        </div>
        {error && <span className={styles.errorMessage}>{error}</span>}
      </div>
    );
  },
);

PhoneInput.displayName = 'PhoneInput';
