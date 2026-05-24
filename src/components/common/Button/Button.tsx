import React, { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

import styles from './Button.module.scss';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'error' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  isLoading = false,
  ...props
}) => {
  const variantClass = styles[variant];
  const sizeClass = styles[size];

  return (
    <button
      className={`${styles.btn} ${variantClass} ${sizeClass} ${className} ${props.disabled ? styles.disabled : ''} ${isLoading ? styles.loading : ''}`.trim()}
      {...props}
      disabled={isLoading || props.disabled}
    >
      {isLoading && <Loader2 size={16} className={styles.spinner} />}
      {children}
    </button>
  );
};
