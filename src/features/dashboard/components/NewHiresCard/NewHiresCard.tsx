import React from 'react';
import { UserRoundPlus } from 'lucide-react';

import { useNewHires } from '../../hooks/useNewHires';

import styles from './NewHiresCard.module.scss';

const Initials: React.FC<{ name: string }> = ({ name }) => {
  const parts = name.trim().split(' ');
  const initials = parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0];
  return <div className={styles.avatar}>{initials.toUpperCase()}</div>;
};

export const NewHiresCard: React.FC = () => {
  const { hires, loading, error } = useNewHires();

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.iconWrap}>
          <UserRoundPlus size={18} strokeWidth={1.8} />
        </span>
        <div>
          <div className={styles.title}>New Hires</div>
          <div className={styles.subtitle}>
            {loading ? 'Loading…' : `${hires.length} hire${hires.length !== 1 ? 's' : ''}`}
          </div>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && hires.length === 0 && (
        <p className={styles.empty}>No new hires this month.</p>
      )}

      {loading && (
        <div className={styles.list}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeleton}>
              <div className={styles.skeletonAvatar} />
              <div className={styles.skeletonLines}>
                <div className={styles.skeletonName} />
                <div className={styles.skeletonDept} />
              </div>
              <div className={styles.skeletonDate} />
            </div>
          ))}
        </div>
      )}

      {!loading && hires.length > 0 && (
        <div className={`${styles.list} ${hires.length > 5 ? styles.listScrollable : ''}`}>
          {hires.map((hire) => (
            <div key={hire.id} className={styles.item}>
              <Initials name={hire.name} />
              <div className={styles.info}>
                <div className={styles.name}>{hire.name}</div>
                <div className={styles.department}>{hire.department ?? '—'}</div>
              </div>
              {hire.joining_date && (
                <div className={styles.joining}>Joining: {hire.joining_date}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
