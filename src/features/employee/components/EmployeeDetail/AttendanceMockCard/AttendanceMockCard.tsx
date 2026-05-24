import React, { useMemo, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

import { useEmployeeAttendanceHistory } from '../../../hooks/useEmployeeAttendanceHistory';

import styles from './AttendanceMockCard.module.scss';

import type { AttendanceHistoryItem } from '../../../../../api/attendance';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MAX_HOURS_PER_DAY = 9;
const MONTH_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// Map server AttendanceStatus enum to calendar cell status colour
type CellStatus = 'present' | 'late' | 'leave' | 'absent' | 'weekend' | 'out';

const statusToCell = (status: string): CellStatus => {
  switch (status) {
    case 'PRESENT':
    case 'OVERTIME':
    case 'PENDING_APPROVAL':
      return 'present';
    case 'LATE':
    case 'HALF_DAY':
    case 'MISSED_CHECKOUT':
      return 'late';
    case 'ON_LEAVE':
    case 'HOLIDAY':
      return 'leave';
    case 'ABSENT':
      return 'absent';
    case 'WEEKLY_OFF':
      return 'weekend';
    default:
      return 'absent';
  }
};

const formatHmm = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
};

// ── Hours Logged card ──────────────────────────────────────────────────────
interface HoursLoggedCardProps {
  employeeId: string | undefined;
}

const getCurrentWeekRange = (today: Date) => {
  // Week starts Sunday
  const dayOfWeek = today.getDay();
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  start.setDate(today.getDate() - dayOfWeek);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
};

const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const HoursLoggedMockCard: React.FC<HoursLoggedCardProps> = ({ employeeId }) => {
  const today = useMemo(() => new Date(), []);
  const { start: weekStart, end: weekEnd } = useMemo(() => getCurrentWeekRange(today), [today]);

  // Pull current month (and previous month if the week spans across)
  const needsPrevMonth = weekStart.getMonth() !== weekEnd.getMonth();
  const currentMonthParams = {
    month: weekEnd.getMonth() + 1,
    year: weekEnd.getFullYear(),
    limit: 31,
  };
  const prevMonthParams = {
    month: weekStart.getMonth() + 1,
    year: weekStart.getFullYear(),
    limit: 31,
  };

  const { data: current, isLoading: loadingCurrent } = useEmployeeAttendanceHistory(
    employeeId,
    currentMonthParams,
  );
  const { data: prev, isLoading: loadingPrev } = useEmployeeAttendanceHistory(
    needsPrevMonth ? employeeId : undefined,
    prevMonthParams,
  );

  const isLoading = loadingCurrent || (needsPrevMonth && loadingPrev);

  const byDate = useMemo(() => {
    const map = new Map<string, AttendanceHistoryItem>();
    current?.items.forEach((it) => map.set(it.date, it));
    prev?.items.forEach((it) => map.set(it.date, it));
    return map;
  }, [current, prev]);

  const days = useMemo(() => {
    return WEEK_DAYS.map((day, idx) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + idx);
      const rec = byDate.get(dateKey(date));
      const minutes = rec ? rec.worked_minutes : 0;
      const isWeekend = idx === 0 || idx === 6;
      return { day, minutes, isWeekend };
    });
  }, [weekStart, byDate]);

  const totalMinutes = days.reduce((sum, d) => sum + d.minutes, 0);
  const totalH = Math.floor(totalMinutes / 60);
  const totalM = totalMinutes % 60;

  return (
    <div className={styles.hoursCard}>
      <div className={styles.hoursTopRow}>
        <span className={styles.hoursTitle}>Hours Logged</span>
        <span className={styles.weekSelector}>This week</span>
      </div>

      <div className={styles.hoursTotal}>
        <span className={styles.hoursBig}>{totalH}</span>
        <span className={styles.hoursUnit}>h</span>
        <span className={styles.hoursBig}>{totalM}</span>
        <span className={styles.hoursUnit}>m</span>
      </div>

      <div className={styles.barChart}>
        {days.map((d) => {
          const hours = d.minutes / 60;
          const fillPct = hours > 0 ? Math.min((hours / MAX_HOURS_PER_DAY) * 100, 100) : 0;
          const label = formatHmm(d.minutes);
          return (
            <div key={d.day} className={styles.barCol}>
              <span className={`${styles.timeLabel} ${d.isWeekend ? styles.timeLabelDim : ''}`}>
                {isLoading ? '–' : label}
              </span>
              <div className={styles.barTrack}>
                {d.isWeekend ? (
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
interface AttendanceCalendarCardProps {
  employeeId: string | undefined;
}

interface CalCell {
  day: number;
  status: CellStatus;
  inMonth: boolean;
}

const buildCalendar = (
  year: number,
  month0: number,
  byDate: Map<string, AttendanceHistoryItem>,
): CalCell[] => {
  const firstOfMonth = new Date(year, month0, 1);
  const lastOfMonth = new Date(year, month0 + 1, 0);
  const daysInMonth = lastOfMonth.getDate();

  const leadingBlanks = firstOfMonth.getDay(); // Sun-start
  const cells: CalCell[] = [];

  // Leading days from previous month
  if (leadingBlanks > 0) {
    const prevLast = new Date(year, month0, 0).getDate();
    for (let i = leadingBlanks - 1; i >= 0; i--) {
      cells.push({ day: prevLast - i, status: 'out', inMonth: false });
    }
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month0, d);
    const key = dateKey(date);
    const rec = byDate.get(key);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    let status: CellStatus;
    if (rec) {
      status = statusToCell(rec.attendance_status);
    } else if (isWeekend) {
      status = 'weekend';
    } else {
      status = 'out';
    }
    cells.push({ day: d, status, inMonth: true });
  }

  // Trailing days to complete the last week
  const trailing = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= trailing; i++) {
    cells.push({ day: i, status: 'out', inMonth: false });
  }

  return cells;
};

export const AttendanceCalendarMockCard: React.FC<AttendanceCalendarCardProps> = ({
  employeeId,
}) => {
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  const { data, isLoading } = useEmployeeAttendanceHistory(employeeId, {
    month: viewMonth + 1,
    year: viewYear,
    limit: 31,
  });

  const byDate = useMemo(() => {
    const map = new Map<string, AttendanceHistoryItem>();
    data?.items.forEach((it) => map.set(it.date, it));
    return map;
  }, [data]);

  const cells = useMemo(
    () => buildCalendar(viewYear, viewMonth, byDate),
    [viewYear, viewMonth, byDate],
  );

  const legend = useMemo(() => {
    const counts: Record<CellStatus, number> = {
      present: 0,
      late: 0,
      leave: 0,
      absent: 0,
      weekend: 0,
      out: 0,
    };
    data?.items.forEach((it) => {
      const status = statusToCell(it.attendance_status);
      counts[status] = (counts[status] ?? 0) + 1;
    });
    return [
      { label: 'Present', status: 'present' as const, count: counts.present },
      { label: 'Late', status: 'late' as const, count: counts.late },
      { label: 'Leave', status: 'leave' as const, count: counts.leave },
      { label: 'Absent', status: 'absent' as const, count: counts.absent },
    ];
  }, [data]);

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  return (
    <div className={styles.calCard}>
      <div className={styles.calHeader}>
        <span className={styles.calTitle}>Attendance</span>
        <div className={styles.monthNav}>
          <button
            type="button"
            className={styles.navBtn}
            onClick={goPrev}
            aria-label="Previous month"
          >
            <ChevronLeft size={14} />
          </button>
          <span className={styles.monthLabel}>
            <Calendar size={14} />
            {MONTH_NAMES_SHORT[viewMonth]}, {viewYear}
          </span>
          <button type="button" className={styles.navBtn} onClick={goNext} aria-label="Next month">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className={styles.calGrid} style={{ opacity: isLoading ? 0.5 : 1 }}>
        {WEEK_DAYS.map((wd) => (
          <div key={wd} className={styles.calWeekDay}>
            {wd}
          </div>
        ))}
        {cells.map((cell, idx) => (
          <div
            key={idx}
            className={`${styles.calCell} ${styles[`s_${cell.inMonth ? cell.status : 'out'}`]}`}
          >
            {cell.day}
          </div>
        ))}
      </div>

      <div className={styles.legend}>
        {legend.map((l) => (
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
