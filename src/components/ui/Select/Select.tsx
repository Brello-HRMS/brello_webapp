import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

import styles from './Select.module.scss';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, ...props }, ref) => {
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
        <div className={styles.selectWrapper}>
          <select
            {...props}
            ref={ref}
            className={`${styles.select} ${className || ''}`}
            defaultValue={props.defaultValue ?? ''}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className={styles.chevron}>
            <ChevronDown size={16} />
          </span>
        </div>
        {error && <span className={styles.errorMessage}>{error}</span>}
      </div>
    );
  },
);

Select.displayName = 'Select';
