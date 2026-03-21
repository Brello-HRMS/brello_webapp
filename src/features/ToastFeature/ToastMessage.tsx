import React from 'react';

import Check from '../../assets/Check.svg';
import { capitalize } from '../../utils/stringUtils';

import styles from './ToastMessage.module.scss';

export type SnackbarSeverity = 'success' | 'error' | 'warning' | 'info';

export interface SnackbarProps {
  message: string;
  severity: SnackbarSeverity;
}

const iconMap: Record<SnackbarSeverity, string> = {
  success: Check,
  error: Check,
  warning: Check,
  info: Check,
};

const ToastMessage: React.FC<SnackbarProps> = ({ message, severity = 'success' }) => {
  return (
    <div className={styles.container}>
      <div className={styles.messageContainer}>
        <div className={styles.iconContainer}>
          <img src={iconMap[severity]} />
        </div>
        <div className={styles.textContainer}>
          <h4>{capitalize(severity)}</h4>
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ToastMessage;
