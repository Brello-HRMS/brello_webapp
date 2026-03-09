import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import styles from './Input.module.scss';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

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
          {icon && <span className={styles.icon}>{icon}</span>}
          <input
            {...props}
            type={inputType}
            ref={ref}
            className={`${styles.input} ${icon ? styles.withIcon : ''} ${isPassword ? styles.withEye : ''} ${className || ''}`}
          />
          {isPassword && (
            <button
              type="button"
              className={styles.eyeToggle}
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        {error && <span className={styles.errorMessage}>{error}</span>}
      </div>
    );
  },
);

Input.displayName = 'Input';
