import React from 'react';
import { UserRoundPlus } from 'lucide-react';

import styles from './NewHiresCard.module.scss';

import type { NewHire } from '../../types/dashboardTypes';

interface NewHiresCardProps {
  hires: NewHire[];
}

const Initials: React.FC<{ name: string }> = ({ name }) => {
  const parts = name.trim().split(' ');
  const initials = parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0];
  return <div className={styles.avatar}>{initials.toUpperCase()}</div>;
};

export const NewHiresCard: React.FC<NewHiresCardProps> = ({ hires }) => (
  <div className={styles.card}>
    <div className={styles.header}>
      <span className={styles.iconWrap}>
        <UserRoundPlus size={18} strokeWidth={1.8} />
      </span>
      <div>
        <div className={styles.title}>New Hires</div>
        <div className={styles.subtitle}>
          {hires.length} hire{hires.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>

    <div className={styles.list}>
      {hires.map((hire) => (
        <div key={hire.id} className={styles.item}>
          <Initials name={hire.name} />
          <div className={styles.info}>
            <div className={styles.name}>{hire.name}</div>
            <div className={styles.department}>{hire.department}</div>
          </div>
          <div className={styles.joining}>Joining: {hire.joiningDate}</div>
        </div>
      ))}
    </div>
  </div>
);
