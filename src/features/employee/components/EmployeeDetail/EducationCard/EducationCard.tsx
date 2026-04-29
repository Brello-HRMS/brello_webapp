import React from 'react';
import { MoreHorizontal } from 'lucide-react';

import styles from './EducationCard.module.scss';

import type { EducationItem } from '../../../types/employeeType';

interface EducationCardProps {
  education: EducationItem[];
}

const formatYear = (dateStr: string | null | undefined, year: string | null | undefined) => {
  if (year) return year;
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).getFullYear().toString();
  } catch {
    return '—';
  }
};

export const EducationCard: React.FC<EducationCardProps> = ({ education }) => {
  if (!education || education.length === 0) {
    return (
      <div className={styles.wrapper}>
        <h3 className={styles.sectionTitle}>Education</h3>
        <p className={styles.empty}>No education records found.</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.sectionTitle}>Education</h3>
      <div className={styles.list}>
        {education.map((item, index) => (
          <div key={item.id} className={styles.item}>
            <div className={styles.itemHeader}>
              <span className={styles.itemTitle}>Education {index + 1}</span>
              <button className={styles.moreBtn} aria-label="More options">
                <MoreHorizontal size={16} />
              </button>
            </div>
            <div className={styles.grid}>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>SCHOOL/COLLEGE</span>
                <span className={styles.fieldValue}>{item.school_name || '—'}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>DEGREE</span>
                <span className={styles.fieldValue}>{item.degree || '—'}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>FIELD</span>
                <span className={styles.fieldValue}>{item.field_of_study || '—'}</span>
              </div>
              <div className={styles.field}>
                <span className={styles.fieldLabel}>YEAR</span>
                <span className={styles.fieldValue}>
                  {formatYear(item.completion_date, item.completion_year)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
