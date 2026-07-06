import React from 'react';

import { Dialog } from '../../../../components/common';
import { IssuedLetterCard } from '../IssuedLetterCard/IssuedLetterCard';

import styles from './EmployeeLettersDrawer.module.scss';

import type { IssuedLetter } from '../../types/letterTypes';

interface EmployeeLettersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  employeeName: string;
  letters: IssuedLetter[];
  categoryNameById: Record<string, string>;
  onDownload: (letter: IssuedLetter) => void;
  onPreview: (letter: IssuedLetter) => void;
}

export const EmployeeLettersDrawer: React.FC<EmployeeLettersDrawerProps> = ({
  isOpen,
  onClose,
  employeeName,
  letters,
  categoryNameById,
  onDownload,
  onPreview,
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={employeeName}
      description={`${letters.length} ${letters.length === 1 ? 'letter' : 'letters'} issued`}
      position="right"
      maxWidth="640px"
    >
      <div className={styles.grid}>
        {letters.map((letter) => (
          <IssuedLetterCard
            key={letter.id}
            letter={letter}
            employeeName={employeeName}
            categoryName={categoryNameById[letter.category_id] || '—'}
            onDownload={() => onDownload(letter)}
            onPreview={() => onPreview(letter)}
          />
        ))}
      </div>
    </Dialog>
  );
};
