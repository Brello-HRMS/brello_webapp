import React from 'react';

import styles from './ToggleButton.module.scss';

export interface ToggleButtonProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  checked,
  onChange,
  disabled,
  label,
}) => {
  return (
    <div className={styles.container}>
      {label && <span className={styles.label}>{label}</span>}
      <button
        type="button"
        className={`${styles.toggle} ${checked ? styles.checked : ''}`}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        aria-pressed={checked}
      >
        <span className={styles.slider} />
      </button>
    </div>
  );
};
