import React from 'react';
import { Archive, ArchiveRestore, Copy, Edit2, Eye, FileText, SendHorizonal } from 'lucide-react';

import { StatusBadge } from '../../../../components/common/StatusBadge/StatusBadge';

import styles from './TemplateListCard.module.scss';

import type { LetterTemplate } from '../../types/letterTypes';

export interface TemplateListCardProps {
  template: LetterTemplate;
  categoryName: string;
  onPreview: () => void;
  onEdit: () => void;
  onPublish?: () => void;
  onDuplicate?: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
}

export const TemplateListCard: React.FC<TemplateListCardProps> = ({
  template,
  categoryName,
  onPreview,
  onEdit,
  onPublish,
  onDuplicate,
  onArchive,
  onUnarchive,
}) => {
  const { name, template_status, version } = template;

  const handleCardClick = () => {
    if (template_status === 'ARCHIVED') {
      onPreview();
    } else {
      onEdit();
    }
  };

  const stopAnd = (fn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn();
  };

  return (
    <div className={styles.card} onClick={handleCardClick}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <FileText size={24} />
        </div>
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.category}>{categoryName}</p>
        <p className={styles.version}>{`v${version}`}</p>
      </div>

      <div className={styles.footer}>
        <StatusBadge status={template_status} />

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.iconButton}
            title="Preview"
            onClick={stopAnd(onPreview)}
          >
            <Eye size={16} />
          </button>
          {template_status !== 'ARCHIVED' && (
            <button
              type="button"
              className={styles.iconButton}
              title="Edit"
              onClick={stopAnd(onEdit)}
            >
              <Edit2 size={16} />
            </button>
          )}
          {onPublish && template_status === 'DRAFT' && (
            <button
              type="button"
              className={styles.iconButton}
              title="Publish"
              onClick={stopAnd(onPublish)}
            >
              <SendHorizonal size={16} />
            </button>
          )}
          {onDuplicate && (
            <button
              type="button"
              className={styles.iconButton}
              title="Duplicate"
              onClick={stopAnd(onDuplicate)}
            >
              <Copy size={16} />
            </button>
          )}
          {onArchive && template_status !== 'ARCHIVED' && (
            <button
              type="button"
              className={`${styles.iconButton} ${styles.deleteButton}`}
              title="Archive"
              onClick={stopAnd(onArchive)}
            >
              <Archive size={16} />
            </button>
          )}
          {onUnarchive && template_status === 'ARCHIVED' && (
            <button
              type="button"
              className={styles.iconButton}
              title="Unarchive"
              onClick={stopAnd(onUnarchive)}
            >
              <ArchiveRestore size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateListCard;
