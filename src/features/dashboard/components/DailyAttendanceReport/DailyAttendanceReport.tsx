import React from 'react';
import { ClipboardList } from 'lucide-react';

import styles from './DailyAttendanceReport.module.scss';

import type { AttendanceReportRow } from '../../types/dashboardTypes';

interface DailyAttendanceReportProps {
  rows: AttendanceReportRow[];
}

export const DailyAttendanceReport: React.FC<DailyAttendanceReportProps> = ({ rows }) => (
  <div className={styles.card}>
    <div className={styles.header}>
      <span className={styles.iconWrap}>
        <ClipboardList size={18} strokeWidth={1.8} />
      </span>
      <div className={styles.title}>Daily Attendance Report</div>
    </div>

    <div className={styles.list}>
      {rows.map((row) => (
        <div key={row.label} className={styles.row}>
          <span className={styles.label}>{row.label}</span>
          <span className={styles.count}>{row.count}</span>
        </div>
      ))}
    </div>
  </div>
);
