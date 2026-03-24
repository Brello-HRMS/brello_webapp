import React, { useState, useRef } from 'react';
import {
  FilePen,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
} from 'lucide-react';

import { Dialog, Button } from '../../../../components/common';
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
  const editorRef = useRef<HTMLDivElement>(null);

  if (!policy && !isLoading) return null;

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleSave = () => {
    if (!policy) return;
    const content = editorRef.current?.innerHTML || '';
    onEdit({ ...policy, title: editTitle, content });
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
              <div className={styles.toolbar}>
                <button type="button" className={styles.tbBtn} onClick={() => execCommand('bold')}>
                  <Bold size={13} />
                </button>
                <button
                  type="button"
                  className={styles.tbBtn}
                  onClick={() => execCommand('italic')}
                >
                  <Italic size={13} />
                </button>
                <button
                  type="button"
                  className={styles.tbBtn}
                  onClick={() => execCommand('underline')}
                >
                  <Underline size={13} />
                </button>
                <button
                  type="button"
                  className={styles.tbBtn}
                  onClick={() => execCommand('strikeThrough')}
                >
                  <Strikethrough size={13} />
                </button>
                <div className={styles.tbDivider} />
                <button
                  type="button"
                  className={styles.tbBtn}
                  onClick={() => execCommand('formatBlock', 'pre')}
                >
                  <Code size={13} />
                </button>
                <div className={styles.tbDivider} />
                <button
                  type="button"
                  className={styles.tbBtn}
                  onClick={() => execCommand('justifyLeft')}
                >
                  <AlignLeft size={13} />
                </button>
                <button
                  type="button"
                  className={styles.tbBtn}
                  onClick={() => execCommand('justifyCenter')}
                >
                  <AlignCenter size={13} />
                </button>
                <button
                  type="button"
                  className={styles.tbBtn}
                  onClick={() => execCommand('justifyRight')}
                >
                  <AlignRight size={13} />
                </button>
                <div className={styles.tbDivider} />
                <button
                  type="button"
                  className={styles.tbBtn}
                  onClick={() => execCommand('insertUnorderedList')}
                >
                  <List size={13} />
                </button>
                <button
                  type="button"
                  className={styles.tbBtn}
                  onClick={() => execCommand('insertOrderedList')}
                >
                  <ListOrdered size={13} />
                </button>
              </div>
              <div
                ref={editorRef}
                className={styles.editor}
                contentEditable
                suppressContentEditableWarning
                dangerouslySetInnerHTML={{ __html: policy?.content || '' }}
              />
            </div>
          </div>
        ) : policy?.content ? (
          <div
            className={styles.richContent}
            dangerouslySetInnerHTML={{ __html: policy.content }}
          />
        ) : (
          <p className={styles.placeholder}>No content available for this policy.</p>
        )}
      </div>
    </Dialog>
  );
};

export default PolicyViewDialog;
