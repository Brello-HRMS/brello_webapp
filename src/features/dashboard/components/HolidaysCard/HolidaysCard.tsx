import React from 'react';
import { Star } from 'lucide-react';

import { useHolidays } from '../../hooks/useHolidays';

import styles from './HolidaysCard.module.scss';

export const HolidaysCard: React.FC = () => {
  const { holidays, loading, error } = useHolidays();

  const monthName = new Date().toLocaleString('default', { month: 'long' });

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.iconWrap}>
          <Star size={18} strokeWidth={1.8} />
        </span>
        <div>
          <div className={styles.title}>Holidays in {monthName}</div>
          <div className={styles.subtitle}>
            {loading ? 'Loading…' : `${holidays.length} day${holidays.length !== 1 ? 's' : ''}`}
          </div>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && holidays.length === 0 && (
        <p className={styles.empty}>No holidays this month.</p>
      )}

      {loading && (
        <div className={styles.list}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeleton}>
              <div className={styles.skeletonLines}>
                <div className={styles.skeletonName} />
                <div className={styles.skeletonDay} />
              </div>
              <div className={styles.skeletonBadge} />
            </div>
          ))}
        </div>
      )}

      {!loading && holidays.length > 0 && (
        <div className={`${styles.list} ${holidays.length > 5 ? styles.listScrollable : ''}`}>
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
      )}
    </div>
  );
};
