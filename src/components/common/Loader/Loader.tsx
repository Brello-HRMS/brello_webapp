import React from 'react';

import styles from './Loader.module.scss';

interface LoaderProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const Loader: React.FC<LoaderProps> = ({ className = '', size = 'md' }) => {
  const sizeClass = {
    xs: styles.sizeXs,
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
  }[size];

  return (
    <div className={`${styles.loader} ${sizeClass} ${className}`}>
      <div className={styles.b}></div>
      <div className={`${styles.b} ${styles.x}`}></div>
      <div className={styles.b}></div>
      <div className={styles.b}></div>
    </div>
  );
};
