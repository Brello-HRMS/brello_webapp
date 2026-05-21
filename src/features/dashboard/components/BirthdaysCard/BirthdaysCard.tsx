import React from 'react';
import { PartyPopper } from 'lucide-react';

import { useBirthdays } from '../../hooks/useBirthdays';

import styles from './BirthdaysCard.module.scss';

const Initials: React.FC<{ name: string }> = ({ name }) => {
  const parts = name.trim().split(' ');
  const initials = parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0];
  return <div className={styles.avatar}>{initials.toUpperCase()}</div>;
};

export const BirthdaysCard: React.FC = () => {
  const { birthdays, loading, error } = useBirthdays();

  const monthName = new Date().toLocaleString('default', { month: 'long' });

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.iconWrap}>
          <PartyPopper size={18} strokeWidth={1.8} />
        </span>
        <div>
          <div className={styles.title}>Birthdays in {monthName}</div>
          <div className={styles.subtitle}>
            {loading
              ? 'Loading…'
              : `${birthdays.length} Birthday${birthdays.length !== 1 ? 's' : ''}`}
          </div>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && birthdays.length === 0 && (
        <p className={styles.empty}>No birthdays this month.</p>
      )}

      {loading && (
        <div className={styles.list}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeleton}>
              <div className={styles.skeletonAvatar} />
              <div className={styles.skeletonLines}>
                <div className={styles.skeletonName} />
                <div className={styles.skeletonId} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && birthdays.length > 0 && (
        <div className={`${styles.list} ${birthdays.length > 5 ? styles.listScrollable : ''}`}>
          {birthdays.map((emp) => (
            <div key={emp.id} className={styles.item}>
              <Initials name={emp.name} />
              <div className={styles.info}>
                <div className={styles.name}>{emp.name}</div>
                <div className={styles.empId}>
                  {emp.employee_id ? `ID: ${emp.employee_id}` : '—'}
                </div>
              </div>
              {emp.birth_day != null && <div className={styles.dayBadge}>{emp.birth_day}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
