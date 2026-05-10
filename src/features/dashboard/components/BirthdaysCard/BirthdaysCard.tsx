import React from 'react';
import { PartyPopper } from 'lucide-react';

import styles from './BirthdaysCard.module.scss';

import type { BirthdayEmployee } from '../../types/dashboardTypes';

interface BirthdaysCardProps {
  birthdays: BirthdayEmployee[];
}

const Initials: React.FC<{ name: string }> = ({ name }) => {
  const parts = name.trim().split(' ');
  const initials = parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0];
  return <div className={styles.avatar}>{initials.toUpperCase()}</div>;
};

export const BirthdaysCard: React.FC<BirthdaysCardProps> = ({ birthdays }) => (
  <div className={styles.card}>
    <div className={styles.header}>
      <span className={styles.iconWrap}>
        <PartyPopper size={18} strokeWidth={1.8} />
      </span>
      <div>
        <div className={styles.title}>Birthdays This Week</div>
        <div className={styles.subtitle}>
          {birthdays.length} Birthday{birthdays.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>

    <div className={styles.list}>
      {birthdays.map((emp) => (
        <div key={emp.id} className={styles.item}>
          <Initials name={emp.name} />
          <div className={styles.info}>
            <div className={styles.name}>{emp.name}</div>
            <div className={styles.empId}>ID: {emp.empId}</div>
          </div>
          <div className={styles.dayBadge}>{emp.birthDay}</div>
        </div>
      ))}
    </div>
  </div>
);
