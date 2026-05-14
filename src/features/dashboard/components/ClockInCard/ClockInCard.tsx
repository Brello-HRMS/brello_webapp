import React from 'react';
import { LogIn, LogOut } from 'lucide-react';

import { formatFullDate, getDayName } from '../../../../utils/timeUtils';
import { useClock } from '../../hooks/useClock';

import styles from './ClockInCard.module.scss';

export const ClockInCard: React.FC = () => {
  const { isClockedIn, formattedTime, totalClockInTime, toggle } = useClock();

  return (
    <div className={styles.card}>
      <div className={styles.dateRow}>
        <span className={styles.date}>{formatFullDate()}</span>
      </div>

      <div className={styles.timer}>{formattedTime}</div>

      <div className={styles.shiftInfo}>
        <span className={styles.shiftDay}>{getDayName()}</span>
        <span className={styles.separator}>|</span>
        <span className={styles.shiftTime}>9:30 – 5:30 PM</span>
      </div>

      <button
        className={`${styles.clockBtn} ${isClockedIn ? styles.clockOut : styles.clockIn}`}
        onClick={toggle}
      >
        {isClockedIn ? (
          <LogOut size={16} strokeWidth={2.2} />
        ) : (
          <LogIn size={16} strokeWidth={2.2} />
        )}
        {isClockedIn ? 'Clock Out' : 'Clock In'}
      </button>

      <div className={styles.totalTime}>
        Clock In Today : <span>{totalClockInTime}</span>
      </div>
    </div>
  );
};
