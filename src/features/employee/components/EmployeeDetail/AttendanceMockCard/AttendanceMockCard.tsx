import React from 'react';
import { Calendar } from 'lucide-react';

import styles from './AttendanceMockCard.module.scss';

const MOCK_HOURS = [
  { day: 'Sun', hours: 0, label: '0:00' },
  { day: 'Mon', hours: 8, label: '8:00' },
  { day: 'Tue', hours: 5.5, label: '5:30' },
  { day: 'Wed', hours: 8, label: '8:00' },
  { day: 'Thu', hours: 7, label: '7:00' },
  { day: 'Fri', hours: 8, label: '8:00' },
  { day: 'Sat', hours: 0, label: '0:00' },
];

const MAX_HOURS = 9;
const TOTAL_H = 36;
const TOTAL_M = 30;

// ── Hours Logged card ──────────────────────────────────────────────────────
export const HoursLoggedMockCard: React.FC = () => {
  return (
    <div className={styles.hoursCard}>
      <div className={styles.hoursTopRow}>
        <span className={styles.hoursTitle}>Hours Logged</span>
        <button className={styles.weekSelector}>
          This week
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      <div className={styles.hoursTotal}>
        <span className={styles.hoursBig}>{TOTAL_H}</span>
        <span className={styles.hoursUnit}>h</span>
        <span className={styles.hoursBig}>{TOTAL_M}</span>
        <span className={styles.hoursUnit}>m</span>
      </div>

      <div className={styles.barChart}>
        {MOCK_HOURS.map((d) => {
          const fillPct = d.hours > 0 ? (d.hours / MAX_HOURS) * 100 : 0;
          const isWeekend = d.day === 'Sun' || d.day === 'Sat';
          return (
            <div key={d.day} className={styles.barCol}>
              <span className={`${styles.timeLabel} ${isWeekend ? styles.timeLabelDim : ''}`}>
                {d.label}
              </span>
              <div className={styles.barTrack}>
                {isWeekend ? (
                  <div className={styles.barWeekend} />
                ) : (
                  <div className={styles.barFilled} style={{ height: `${fillPct}%` }} />
                )}
              </div>
              <span className={styles.barDay}>{d.day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Attendance Calendar card ───────────────────────────────────────────────

type CellStatus = 'present' | 'late' | 'leave' | 'absent' | 'weekend' | 'out';
interface CalCell {
  day: number;
  status: CellStatus;
}

const CAL: CalCell[] = [
  { day: 28, status: 'out' },
  { day: 29, status: 'out' },
  { day: 30, status: 'out' },
  { day: 31, status: 'out' },
  { day: 1, status: 'leave' },
  { day: 2, status: 'present' },
  { day: 3, status: 'weekend' },
  { day: 4, status: 'weekend' },
  { day: 5, status: 'late' },
  { day: 6, status: 'present' },
  { day: 7, status: 'present' },
  { day: 8, status: 'present' },
  { day: 9, status: 'present' },
  { day: 10, status: 'weekend' },
  { day: 11, status: 'weekend' },
  { day: 12, status: 'present' },
  { day: 13, status: 'late' },
  { day: 14, status: 'present' },
  { day: 15, status: 'absent' },
  { day: 16, status: 'present' },
  { day: 17, status: 'weekend' },
  { day: 18, status: 'weekend' },
  { day: 19, status: 'present' },
  { day: 20, status: 'present' },
  { day: 21, status: 'present' },
  { day: 22, status: 'late' },
  { day: 23, status: 'late' },
  { day: 24, status: 'weekend' },
  { day: 25, status: 'weekend' },
  { day: 26, status: 'leave' },
  { day: 27, status: 'late' },
  { day: 28, status: 'present' },
  { day: 29, status: 'present' },
  { day: 30, status: 'present' },
  { day: 31, status: 'weekend' },
];

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const LEGEND = [
  { label: 'Present', status: 'present', count: 14 },
  { label: 'Late', status: 'late', count: 5 },
  { label: 'Leave', status: 'leave', count: 2 },
  { label: 'Absent', status: 'absent', count: 1 },
] as const;

export const AttendanceCalendarMockCard: React.FC = () => {
  return (
    <div className={styles.calCard}>
      <div className={styles.calHeader}>
        <span className={styles.calTitle}>Attendance</span>
        <button className={styles.monthSelector}>
          <Calendar size={14} />
          Oct, 2025
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      <div className={styles.calGrid}>
        {WEEK_DAYS.map((wd) => (
          <div key={wd} className={styles.calWeekDay}>
            {wd}
          </div>
        ))}
        {CAL.map((cell, idx) => (
          <div key={idx} className={`${styles.calCell} ${styles[`s_${cell.status}`]}`}>
            {cell.day}
          </div>
        ))}
      </div>

      <div className={styles.legend}>
        {LEGEND.map((l) => (
          <div key={l.label} className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles[`s_${l.status}`]}`} />
            <span className={styles.legendLabel}>{l.label}</span>
            <span className={styles.legendCount}>{l.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
