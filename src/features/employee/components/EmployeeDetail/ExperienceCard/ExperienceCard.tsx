import React from 'react';

import styles from './ExperienceCard.module.scss';

import type { ExperienceItem } from '../../../types/employeeType';

interface ExperienceCardProps {
  experience: ExperienceItem[];
}

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return 'Present';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const ExperienceCard: React.FC<ExperienceCardProps> = ({ experience }) => {
  if (!experience || experience.length === 0) {
    return (
      <div className={styles.wrapper}>
        <h3 className={styles.sectionTitle}>Experience</h3>
        <p className={styles.empty}>No experience records found.</p>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.sectionTitle}>Experience</h3>
      <div className={styles.list}>
        {experience.map((item) => (
          <div key={item.id} className={styles.item}>
            <div className={styles.itemHeader}>
              <span className={styles.company}>{item.company}</span>
            </div>
            <p className={styles.designationLine}>
              <span className={styles.designation}>{item.designation}</span>
              <span className={styles.dateRange}>
                {formatDate(item.from_date)} –{' '}
                {item.is_current ? 'Present' : formatDate(item.to_date)}
              </span>
            </p>
            {item.description && <p className={styles.description}>{item.description}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};
