import React from 'react';
import { Archive, Edit2, FolderTree } from 'lucide-react';

import { StatusBadge } from '../../../../components/common/StatusBadge/StatusBadge';

import styles from './CategoryCard.module.scss';

import type { LetterCategory } from '../../types/letterTypes';

export interface CategoryCardProps {
  category: LetterCategory;
  onEdit?: () => void;
  onArchive?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onEdit, onArchive }) => {
  const { name, description, status } = category;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <FolderTree size={24} />
        </div>
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.description}>{description || 'No description provided.'}</p>
      </div>

      <div className={styles.footer}>
        <StatusBadge status={status} />

        {(onEdit || onArchive) && (
          <div className={styles.actions}>
            {onEdit && (
              <button type="button" className={styles.iconButton} title="Edit" onClick={onEdit}>
                <Edit2 size={16} />
              </button>
            )}
            {onArchive && (
              <button
                type="button"
                className={`${styles.iconButton} ${styles.deleteButton}`}
                title="Archive"
                onClick={onArchive}
              >
                <Archive size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
