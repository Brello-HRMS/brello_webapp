import React from 'react';
import { Star } from 'lucide-react';

import styles from './HolidaysCard.module.scss';

import type { Holiday } from '../../types/dashboardTypes';

interface HolidaysCardProps {
  holidays: Holiday[];
  count: number;
}

export const HolidaysCard: React.FC<HolidaysCardProps> = ({ holidays, count }) => (
  <div className={styles.card}>
    <div className={styles.header}>
      <span className={styles.iconWrap}>
        <Star size={18} strokeWidth={1.8} />
      </span>
      <div>
        <div className={styles.title}>Holidays This Month</div>
        <div className={styles.subtitle}>
          {count} day{count !== 1 ? 's' : ''}
        </div>
      </div>
    </div>

    <div className={styles.list}>
      {holidays.map((holiday) => (
        <div key={holiday.id} className={styles.item}>
          <div className={styles.info}>
            <div className={styles.name}>{holiday.name}</div>
            <div className={styles.day}>{holiday.dayOfWeek}</div>
          </div>
          <div className={styles.dateBadge}>{holiday.date}</div>
        </div>
      ))}
    </div>
  </div>
);
