import React from 'react';

import { BillingCycle } from '../../types';

import styles from './BillingCycleToggle.module.scss';

interface BillingCycleToggleProps {
  value: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
}

export const BillingCycleToggle: React.FC<BillingCycleToggleProps> = ({ value, onChange }) => {
  const isYearly = value === BillingCycle.ANNUAL;

  return (
    <div className={styles.wrapper}>
      <span className={`${styles.label} ${!isYearly ? styles.active : ''}`}>Monthly</span>
      <button
        type="button"
        role="switch"
        aria-checked={isYearly}
        className={`${styles.toggle} ${isYearly ? styles.on : styles.off}`}
        onClick={() => onChange(isYearly ? BillingCycle.MONTHLY : BillingCycle.ANNUAL)}
      >
        <span className={styles.thumb} />
      </button>
      <span className={`${styles.label} ${isYearly ? styles.active : ''}`}>
        Yearly <span className={styles.saveBadge}>Save 20%</span>
      </span>
    </div>
  );
};
