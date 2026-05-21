import React from 'react';
import { ClipboardList, Loader2 } from 'lucide-react';

import { useDailyAttendanceReport } from '../../hooks/useDailyAttendanceReport';

import styles from './DailyAttendanceReport.module.scss';

export const DailyAttendanceReport: React.FC = () => {
  const { data, isLoading, error } = useDailyAttendanceReport();

  // If the user doesn't have permission (403), data is explicitly returned as null from the hook
  if (data === null || error) {
    return null;
  }

  const rows = [
    { label: 'Absent', count: data?.summary.absent ?? 0 },
    { label: 'On Leave', count: data?.summary.on_leave ?? 0 },
    { label: 'Remote', count: data?.summary.remote_in ?? 0 },
    { label: 'In Office', count: data?.summary.office_in ?? 0 },
    { label: 'Half Day', count: data?.summary.half_day ?? 0 },
    { label: 'Late', count: data?.summary.late ?? 0 },
  ];

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.iconWrap}>
          <ClipboardList size={18} strokeWidth={1.8} />
        </span>
        <div className={styles.title}>Daily Attendance Report</div>
      </div>

      <div className={styles.list}>
        {isLoading ? (
          <div className={styles.loadingState}>
            <Loader2 className={styles.spinner} size={24} />
          </div>
        ) : (
          rows.map((row) => (
            <div key={row.label} className={styles.row}>
              <span className={styles.label}>{row.label}</span>
              <span className={styles.count}>{row.count}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
