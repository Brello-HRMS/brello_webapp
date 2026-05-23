import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';

import styles from './SetupRequiredBlocker.module.scss';

export const SetupRequiredBlocker: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <Lock size={32} />
      </div>
      <h2 className={styles.title}>Module Locked</h2>
      <p className={styles.description}>
        This module is currently unavailable. Please complete your organization's foundational setup
        from the dashboard before accessing other features.
      </p>
      <button className={styles.dashboardBtn} onClick={() => navigate('/dashboard')}>
        <ArrowLeft size={16} />
        Return to Dashboard
      </button>
    </div>
  );
};
