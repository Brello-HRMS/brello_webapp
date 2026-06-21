import React from 'react';
import styles from './Logo.module.scss';

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', showWordmark = true }) => {
  return (
    <div className={`${styles.logo} ${className}`}>
      <div className={styles.logoMark}>
        <div className={styles.block}></div>
        <div className={`${styles.block} ${styles.x}`}></div>
        <div className={styles.block}></div>
        <div className={styles.block}></div>
      </div>
      {showWordmark && <div className={styles.logoWordmark}>brello</div>}
    </div>
  );
};
