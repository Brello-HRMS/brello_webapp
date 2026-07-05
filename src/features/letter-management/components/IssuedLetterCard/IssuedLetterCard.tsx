import React from 'react';
import { Download, Eye, Send } from 'lucide-react';

import styles from './IssuedLetterCard.module.scss';

import type { IssuedLetter } from '../../types/letterTypes';

export interface IssuedLetterCardProps {
  letter: IssuedLetter;
  employeeName: string;
  categoryName: string;
  onDownload: () => void;
  onPreview: () => void;
}

export const IssuedLetterCard: React.FC<IssuedLetterCardProps> = ({
  letter,
  employeeName,
  categoryName,
  onDownload,
  onPreview,
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <Send size={24} />
        </div>
      </div>

      <div className={styles.content}>
        <h3 className={styles.letterNumber}>{letter.letter_number}</h3>
        <p className={styles.employeeName}>{employeeName}</p>
        <p className={styles.categoryName}>{categoryName}</p>
        <p className={styles.date}>{new Date(letter.generated_at).toLocaleDateString()}</p>
      </div>

      <div className={styles.footer}>
        <button type="button" className={styles.iconButton} title="Preview" onClick={onPreview}>
          <Eye size={16} />
        </button>
        <button type="button" className={styles.iconButton} title="Download" onClick={onDownload}>
          <Download size={16} />
        </button>
      </div>
    </div>
  );
};
