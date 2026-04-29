import React from 'react';
import { FileText, CreditCard, FileImage, File } from 'lucide-react';

import styles from './DocumentsCard.module.scss';

import type { DocumentItem } from '../../../types/employeeType';

interface DocumentsCardProps {
  documents: DocumentItem[];
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'AADHAAR':
      return <CreditCard size={18} />;
    case 'PAN':
      return <FileText size={18} />;
    case 'DRIVING_LICENCE':
    case 'PASSPORT':
      return <FileImage size={18} />;
    default:
      return <File size={18} />;
  }
};

const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'AADHAAR':
      return styles.iconBlue;
    case 'PAN':
      return styles.iconGreen;
    default:
      return styles.iconPurple;
  }
};

export const DocumentsCard: React.FC<DocumentsCardProps> = ({ documents }) => {
  if (!documents || documents.length === 0) {
    return (
      <div className={styles.wrapper}>
        <h3 className={styles.sectionTitle}>Documents</h3>
        <p className={styles.empty}>No documents attached.</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.sectionTitle}>Documents</h3>
      <div className={styles.list}>
        {documents.map((doc) => (
          <div key={doc.id} className={styles.item}>
            <div className={`${styles.iconWrapper} ${getCategoryColor(doc.category)}`}>
              {getCategoryIcon(doc.category)}
            </div>
            <div className={styles.info}>
              <span className={styles.docName}>{doc.name}</span>
              <span className={styles.docCategory}>
                {doc.category === 'AADHAAR'
                  ? '240 KB'
                  : doc.category === 'PAN'
                    ? '311 KB'
                    : '360 KB'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
