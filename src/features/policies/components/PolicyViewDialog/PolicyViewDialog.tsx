import React from 'react';
import { FilePen } from 'lucide-react';

import { Dialog, Button } from '../../../../components/common';

import styles from './PolicyViewDialog.module.scss';

import type { Policy } from '../../types/policyType';

interface PolicyViewDialogProps {
  open: boolean;
  policy: Policy | null;
  onClose: () => void;
  onEdit: (policy: Policy) => void;
}

export const PolicyViewDialog: React.FC<PolicyViewDialogProps> = ({
  open,
  policy,
  onClose,
  onEdit,
}) => {
  if (!policy) return null;

  const actions = (
    <div className={styles.actions}>
      <Button variant="secondary" type="button" onClick={onClose}>
        Save a Copy
      </Button>
      <Button variant="primary" type="button" onClick={() => onEdit(policy)}>
        <FilePen size={16} />
        Edit Policy
      </Button>
    </div>
  );

  return (
    <Dialog
      title={policy.title}
      open={open}
      onClose={onClose}
      actions={actions}
      maxWidth="480px"
      position="right"
    >
      <div className={styles.content}>
        {policy.content ? (
          <div
            className={styles.richContent}
            dangerouslySetInnerHTML={{ __html: policy.content }}
          />
        ) : (
          <p className={styles.placeholder}>Content here...</p>
        )}
      </div>
    </Dialog>
  );
};

export default PolicyViewDialog;
