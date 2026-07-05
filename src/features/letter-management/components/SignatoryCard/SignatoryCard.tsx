import React from 'react';
import { Archive, Edit2, Star } from 'lucide-react';

import { StatusBadge } from '../../../../components/common/StatusBadge/StatusBadge';
import { getInitials } from '../../utils/getInitials';

import styles from './SignatoryCard.module.scss';

import type { Signatory } from '../../types/letterTypes';

export interface SignatoryCardProps {
  signatory: Signatory;
  onEdit?: () => void;
  onSetDefault?: () => void;
  onArchive?: () => void;
}

export const SignatoryCard: React.FC<SignatoryCardProps> = ({
  signatory,
  onEdit,
  onSetDefault,
  onArchive,
}) => {
  const { name, designation, status, is_default } = signatory;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.avatarFallback} title={name}>
          {getInitials(name) || '—'}
        </div>
        {is_default && <span className={styles.defaultBadge}>Default</span>}
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.designation}>{designation}</p>
      </div>

      <div className={styles.footer}>
        <StatusBadge status={status} />

        {(onEdit || (onSetDefault && !is_default) || onArchive) && (
          <div className={styles.actions}>
            {onEdit && (
              <button type="button" className={styles.iconButton} title="Edit" onClick={onEdit}>
                <Edit2 size={16} />
              </button>
            )}
            {onSetDefault && !is_default && (
              <button
                type="button"
                className={styles.iconButton}
                title="Set as Default"
                onClick={onSetDefault}
              >
                <Star size={16} />
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
