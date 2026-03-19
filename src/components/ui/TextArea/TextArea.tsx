import React, { forwardRef } from 'react';

import styles from './TextArea.module.scss';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className={`${styles.container} ${error ? styles.hasError : ''}`}>
        {label && (
          <label className={styles.label} htmlFor={props.id || props.name}>
            {label}
            {props.required && <span className={styles.asterisk}>*</span>}
          </label>
        )}
        <textarea {...props} ref={ref} className={`${styles.textarea} ${className || ''}`} />
        {error && <span className={styles.errorMessage}>{error}</span>}
      </div>
    );
  },
);

TextArea.displayName = 'TextArea';
