import React, { type ReactNode } from 'react';
import { Ban, AlertTriangle } from 'lucide-react';

import { Modal, type ModalProps } from '../Modal/Modal';
import { Button } from '../Button/Button';

import styles from './AlertModal.module.scss';

export interface AlertModalProps extends Omit<ModalProps, 'children'> {
  title: string;
  alertMessage: ReactNode;
  description: ReactNode;
  actionLabel: string;
  onAction: () => void;
  cancelLabel?: string;
  isActionLoading?: boolean;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  alertMessage,
  description,
  actionLabel,
  onAction,
  cancelLabel = 'Close',
  isActionLoading = false,
  className = '',
  ...rest
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={`${styles.alertModal} ${className}`.trim()}
      {...rest}
    >
      <div className={styles.header}>
        <div className={styles.iconBackground}>
          <Ban className={styles.icon} size={20} />
        </div>
        <h2 className={styles.title}>{title}</h2>
      </div>

      <div className={styles.alertBanner}>
        <AlertTriangle className={styles.alertIcon} size={20} />
        <p className={styles.alertText}>{alertMessage}</p>
      </div>

      <div className={styles.body}>
        <p className={styles.description}>{description}</p>
      </div>

      <div className={styles.footer}>
        <Button
          variant="secondary"
          className={styles.cancelButton}
          onClick={onClose}
          disabled={isActionLoading}
        >
          {cancelLabel}
        </Button>
        <Button className={styles.actionButton} onClick={onAction} disabled={isActionLoading}>
          {actionLabel}
        </Button>
      </div>
    </Modal>
  );
};
