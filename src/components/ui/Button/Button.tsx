// import React from 'react';
import { Loader2 } from 'lucide-react';

import styles from './Button.module.scss';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${isLoading ? styles.loading : ''} ${className || ''}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className={styles.spinner} />}
      <span className={isLoading ? styles.hiddenText : ''}>{children}</span>
    </button>
  );
};
