import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

import { Modal, Button, Checkbox } from '../../../../../components/common';

import styles from './InitiateOffboardingModal.module.scss';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onProceed: (effectiveImmediately: boolean) => void;
}

export const InitiateOffboardingModal: React.FC<Props> = ({ isOpen, onClose, onProceed }) => {
  const [effectiveImmediately, setEffectiveImmediately] = useState(false);

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseIcon={true} className={styles.modal}>
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <div className={styles.iconBackground}>
            <AlertTriangle className={styles.icon} size={36} />
          </div>
        </div>

        <h2 className={styles.title}>Initiate Offboarding?</h2>
        <p className={styles.description}>
          This will begin the employee exit process and revoke system access based on the last
          working day.
        </p>

        <div className={styles.checkboxCard}>
          <Checkbox
            label={<span className={styles.checkboxTitle}>Effective Immediately</span>}
            checked={effectiveImmediately}
            onChange={(e) => setEffectiveImmediately(e.target.checked)}
          />
          <p className={styles.checkboxDescription}>
            Access will be revoked immediately. Last working day will be set to today.
          </p>
        </div>
      </div>

      <div className={styles.footer}>
        <Button variant="secondary" onClick={onClose} className={styles.btn}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() => onProceed(effectiveImmediately)}
          className={styles.btn}
        >
          Proceed
        </Button>
      </div>
    </Modal>
  );
};
