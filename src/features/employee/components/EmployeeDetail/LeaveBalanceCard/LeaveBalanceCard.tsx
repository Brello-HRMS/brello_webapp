import React from 'react';

import { useLeaveBalance } from '../../../../leave/hooks/useLeaveBalance';

import styles from './LeaveBalanceCard.module.scss';

const DONUT_COLOR = '#7c3aed';
const DONUT_TRACK = '#e5e7eb';

interface DonutProps {
  used: number;
  total: number | null;
  isUnlimited: boolean;
}

const Donut: React.FC<DonutProps> = ({ used, total, isUnlimited }) => {
  const size = 56;
  const stroke = 6;
  const r = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * r;

  let progress = 0;
  if (!isUnlimited && total && total > 0) {
    progress = Math.min(used / total, 1);
  }

  const dashOffset = circumference * (1 - progress);
  const cx = size / 2;
  const cy = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}
    >
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={DONUT_TRACK} strokeWidth={stroke} />
      {!isUnlimited && (
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={DONUT_COLOR}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
      )}
    </svg>
  );
};

interface LeaveBalanceCardProps {
  employeeId: string | undefined;
}

export const LeaveBalanceCard: React.FC<LeaveBalanceCardProps> = ({ employeeId }) => {
  const { data, isLoading, isError } = useLeaveBalance(employeeId);

  if (isLoading) {
    return (
      <div className={styles.grid}>
        <div
          className={styles.card}
          style={{ height: '120px', backgroundColor: '#f9fafb', animation: 'pulse 1.5s infinite' }}
        />
        <div
          className={styles.card}
          style={{ height: '120px', backgroundColor: '#f9fafb', animation: 'pulse 1.5s infinite' }}
        />
      </div>
    );
  }

  if (isError || !data || !data.data) {
    return (
      <div className={styles.emptyState}>
        <p>No leave balances found.</p>
      </div>
    );
  }

  const leaveData = data.data;

  // Aggregate All Leaves
  const allLeavesUsed = leaveData.balances.reduce(
    (acc, row) => acc + (row.is_unlimited ? 0 : row.consumed_days || 0),
    0,
  );
  const allLeavesTotal = (leaveData.total_available || 0) + allLeavesUsed;

  const displayCards = [
    {
      label: 'All Leaves',
      used: allLeavesUsed,
      total: allLeavesTotal,
      isUnlimited: false,
    },
    ...leaveData.balances.map((b) => ({
      label: b.leave_type_name,
      used: b.consumed_days || 0,
      total: b.is_unlimited ? null : (b.available_days || 0) + (b.consumed_days || 0),
      isUnlimited: b.is_unlimited,
    })),
  ];

  return (
    <div className={styles.grid}>
      {displayCards.map((leave) => (
        <div key={leave.label} className={styles.card}>
          <div className={styles.topRow}>
            <span className={styles.label}>{leave.label}</span>
            <Donut used={leave.used} total={leave.total} isUnlimited={leave.isUnlimited} />
          </div>
          <div className={styles.counter}>
            <span className={styles.used}>{leave.used}</span>
            <span className={styles.total}>/{leave.isUnlimited ? '∞' : leave.total}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
