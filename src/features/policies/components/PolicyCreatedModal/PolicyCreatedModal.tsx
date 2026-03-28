import React from 'react';
import { CheckCircle2, Eye, Plus } from 'lucide-react';

import { Modal } from '../../../../components/common/Modal/Modal';
import { Button } from '../../../../components/common';

import styles from './PolicyCreatedModal.module.scss';

interface PolicyCreatedModalProps {
  isOpen: boolean;
  policyTitle: string;
  onClose: () => void;
  onViewPolicy: () => void;
  onCreateAnother: () => void;
}

export const PolicyCreatedModal: React.FC<PolicyCreatedModalProps> = ({
  isOpen,
  policyTitle,
  onClose,
  onViewPolicy,
  onCreateAnother,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseIcon className={styles.modal}>
      <div className={styles.content}>
        <div className={styles.iconWrap}>
          <CheckCircle2 size={40} className={styles.checkIcon} />
        </div>

        <h2 className={styles.title}>Policy Created</h2>
        <p className={styles.description}>
          Your <strong>"{policyTitle}"</strong> has been successfully written and published.
        </p>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={onViewPolicy}>
            <Eye size={16} />
            View policy
          </Button>
          <Button variant="primary" onClick={onCreateAnother}>
            <Plus size={16} />
            Create another policy
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PolicyCreatedModal;
