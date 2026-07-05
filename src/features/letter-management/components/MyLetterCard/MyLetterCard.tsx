import React from 'react';
import { Download, Eye, FileCheck2 } from 'lucide-react';

import styles from './MyLetterCard.module.scss';

import type { IssuedLetter } from '../../types/letterTypes';

export interface MyLetterCardProps {
  letter: IssuedLetter;
  onDownload: () => void;
  onPreview: () => void;
}

export const MyLetterCard: React.FC<MyLetterCardProps> = ({ letter, onDownload, onPreview }) => {
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
