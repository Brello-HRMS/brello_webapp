import React, { type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

import { Modal, type ModalProps } from '../Modal/Modal';
import { Button } from '../Button/Button';

import styles from './WarningModal.module.scss';

export interface WarningModalProps extends Omit<ModalProps, 'children'> {
  title: string;
  description: ReactNode;
  actionLabel: string;
  onAction: () => void;
  actionVariant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  isActionLoading?: boolean;
}

export const WarningModal: React.FC<WarningModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  actionLabel,
  onAction,
  actionVariant,
  isActionLoading = false,
  className = '',
  ...rest
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className={`${styles.warningModal} ${className}`.trim()}
      {...rest}
    >
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <div className={styles.iconBackground}>
            <AlertTriangle className={styles.icon} size={28} />
          </div>
        </div>

        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
      </div>

      <div className={styles.footer}>
        <Button
          variant="secondary"
          className={styles.cancelButton}
          onClick={onClose}
          disabled={isActionLoading}
        >
          Cancel
        </Button>
        <Button
          variant={actionVariant || 'danger'}
          className={styles.actionButton}
          onClick={onAction}
          disabled={isActionLoading}
        >
          {actionLabel}
        </Button>
      </div>
    </Modal>
  );
};
