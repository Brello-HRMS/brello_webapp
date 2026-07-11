import React from 'react';
import { CheckCircle2, Download, Eye, FileCheck2 } from 'lucide-react';

import { IssuedLetterStatusBadge } from '../IssuedLetterStatusBadge/IssuedLetterStatusBadge';

import styles from './MyLetterCard.module.scss';

import type { IssuedLetter } from '../../types/letterTypes';

export interface MyLetterCardProps {
  letter: IssuedLetter;
  onDownload: () => void;
  onPreview: () => void;
  onAcknowledge: () => void;
}

export const MyLetterCard: React.FC<MyLetterCardProps> = ({
  letter,
  onDownload,
  onPreview,
  onAcknowledge,
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <FileCheck2 size={24} />
        </div>
      </div>

      <div className={styles.content}>
        <h3 className={styles.letterNumber}>{letter.letter_number}</h3>
        <p className={styles.title}>{letter.title}</p>
        <p className={styles.date}>{new Date(letter.generated_at).toLocaleDateString()}</p>
      </div>

      <div className={styles.footer}>
        <IssuedLetterStatusBadge status={letter.delivery_status} />
        <div className={styles.actions}>
          {letter.delivery_status !== 'ACKNOWLEDGED' && (
            <button
              type="button"
              className={styles.iconButton}
              title="Acknowledge"
              onClick={onAcknowledge}
            >
              <CheckCircle2 size={16} />
            </button>
          )}
          <button type="button" className={styles.iconButton} title="Preview" onClick={onPreview}>
            <Eye size={16} />
          </button>
          <button type="button" className={styles.iconButton} title="Download" onClick={onDownload}>
            <Download size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
