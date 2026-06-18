import React from 'react';
import { Users } from 'lucide-react';

import { Button } from '../../../../components/common';
import { usePeersToday } from '../../hooks/usePeersToday';

import styles from './EmployeeDailyAttendanceCard.module.scss';

const Initials: React.FC<{ name: string }> = ({ name }) => {
  const parts = name.trim().split(' ');
  const initials = parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : parts[0][0];
  return <div className={styles.avatar}>{initials.toUpperCase()}</div>;
};

export const EmployeeDailyAttendanceCard: React.FC = () => {
  const { peers, loading, error } = usePeersToday();

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.iconWrap}>
            <Users size={18} strokeWidth={1.8} />
          </span>
          <div>
            <div className={styles.title}>Daily Attendance</div>
            <div className={styles.subtitle}>{peers.length} present today</div>
          </div>
        </div>
        <Button variant="ghost" size="sm" className={styles.viewAllBtn}>
          View All
        </Button>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && peers.length === 0 && (
        <p className={styles.empty}>No one is present today.</p>
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

      {!loading && !error && peers.length > 0 && (
        <div className={`${styles.list} ${peers.length > 5 ? styles.listScrollable : ''}`}>
          {peers.slice(0, 5).map((emp) => (
            <div key={emp.id} className={styles.item}>
              <Initials name={emp.name} />
              <div className={styles.info}>
                <div className={styles.name}>{emp.name}</div>
                <div className={styles.department}>{emp.department ?? '—'}</div>
              </div>
              <div className={styles.time}>{emp.time}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
