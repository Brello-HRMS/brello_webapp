import React, { useState } from 'react';
import { FilePen } from 'lucide-react';

import { Dialog, Button, MarkdownEditor } from '../../../../components/common';
import { Input } from '../../../../components/ui/Input/Input';

import styles from './PolicyViewDialog.module.scss';

import type { Policy } from '../../types/policyType';

interface PolicyViewDialogProps {
  open: boolean;
  policy: Policy | null;
  onClose: () => void;
  onEdit: (policy: Policy) => void;
  onDeactivate: (policy: Policy) => void;
  isDeactivating?: boolean;
  isLoading?: boolean;
}

export const PolicyViewDialog: React.FC<PolicyViewDialogProps> = ({
  open,
  policy,
  onClose,
  onEdit,
  onDeactivate,
  isDeactivating,
  isLoading,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(policy?.title || '');
  const [editContent, setEditContent] = useState(policy?.content || '');

  if (!policy && !isLoading) return null;

  const handleSave = () => {
    if (!policy) return;
    onEdit({ ...policy, title: editTitle, content: editContent });
    setIsEditing(false);
  };

  const actions = (
    <div className={styles.actions}>
      {isEditing ? (
        <>
          <Button variant="secondary" type="button" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button variant="primary" type="button" onClick={handleSave}>
            Save Changes
          </Button>
        </>
      ) : (
        <>
          <Button
            variant="secondary"
            type="button"
            onClick={() => policy && onDeactivate(policy)}
            isLoading={isDeactivating}
            disabled={isLoading || !policy}
          >
            Deactivate
          </Button>
          <Button
            variant="primary"
            type="button"
            onClick={() => setIsEditing(true)}
            disabled={isLoading || !policy}
          >
            <FilePen size={16} />
            Edit Policy
          </Button>
        </>
      )}
    </div>
  );

  return (
    <Dialog
      title={isEditing ? 'Edit Policy' : policy?.title || 'Loading Policy...'}
      description={isEditing ? undefined : policy?.description}
      open={open}
      onClose={() => {
        setIsEditing(false);
        onClose();
      }}
      actions={actions}
      maxWidth="480px"
      position="right"
    >
      <div className={styles.content}>
        {isLoading ? (
          <div className={styles.loadingState}>
            <p>Fetching full policy content...</p>
          </div>
        ) : isEditing ? (
          <div className={styles.editForm}>
            <div className={styles.formGroup}>
              <label>Policy Title</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="e.g. Remote Work Policy"
              />
            </div>

            <div className={styles.editorContainer}>
              <MarkdownEditor value={editContent} onChange={setEditContent} />
            </div>
          </div>
        ) : policy?.content ? (
          <div className={styles.richContent}>
            <MarkdownEditor value={policy.content} previewOnly />
          </div>
        ) : (
          <p className={styles.placeholder}>No content available for this policy.</p>
        )}
      </div>
    </Dialog>
  );
};

export default PolicyViewDialog;
