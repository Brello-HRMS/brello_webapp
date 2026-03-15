import React, { type ButtonHTMLAttributes, type ReactNode } from 'react';

import styles from './Button.module.scss';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  children: ReactNode;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  isLoading = false,
  ...props
}) => {
  const variantClass = styles[variant];

  return (
    <button
      className={`${styles.btn} ${variantClass} ${className}`.trim()}
      {...props}
      disabled={isLoading}
    >
      {children}
    </button>
  );
};
