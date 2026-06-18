import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

import styles from './Button.module.scss';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth,
      children,
      isLoading = false,
      ...props
    },
    ref,
  ) => {
    const classes = [
      styles.button,
      styles[variant],
      styles[size],
      fullWidth ? styles.fullWidth : '',
      className,
      isLoading ? styles.loading : '',
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button ref={ref} className={classes} {...props} disabled={props.disabled || isLoading}>
        {isLoading && <Loader2 className={styles.spinner} />}
        <span className={[styles.content, isLoading ? styles.hiddenText : ''].filter(Boolean).join(' ')}>{children}</span>
      </button>
    );
  },
);

Button.displayName = 'Button';
