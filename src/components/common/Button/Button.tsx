import React, { type ButtonHTMLAttributes, type ReactNode } from 'react';

import styles from './Button.module.scss';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}) => {
  const variantClass = variant === 'secondary' ? styles.secondary : styles.primary;

  return (
    <button className={`${styles.btn} ${variantClass} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
};
