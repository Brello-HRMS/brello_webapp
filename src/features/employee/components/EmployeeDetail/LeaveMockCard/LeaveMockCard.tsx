import React from 'react';

import styles from './LeaveMockCard.module.scss';

interface LeaveCounter {
  label: string;
  used: number;
  total: number;
}

const MOCK_LEAVES: LeaveCounter[] = [
  { label: 'All Leaves', used: 14, total: 20 },
  { label: 'Annual Leaves', used: 10, total: 15 },
  { label: 'Casual Leaves', used: 8, total: 24 },
  { label: 'Sick Leaves', used: 3, total: 4 },
];

const DONUT_COLOR = '#7c3aed';
const DONUT_TRACK = '#e5e7eb';

interface DonutProps {
  used: number;
  total: number;
}

const Donut: React.FC<DonutProps> = ({ used, total }) => {
  const size = 56;
  const stroke = 6;
  const r = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = total === 0 ? 0 : Math.min(used / total, 1);
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
    </svg>
  );
};

export const LeaveMockCard: React.FC = () => {
  return (
    <div className={styles.grid}>
      {MOCK_LEAVES.map((leave) => (
        <div key={leave.label} className={styles.card}>
          <div className={styles.topRow}>
            <span className={styles.label}>{leave.label}</span>
            <Donut used={leave.used} total={leave.total} />
          </div>
          <div className={styles.counter}>
            <span className={styles.used}>{leave.used}</span>
            <span className={styles.total}>/{leave.total}</span>
          </div>
        </div>
      ))}
    </div>
  );
};
