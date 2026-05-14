import React from 'react';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';

import styles from './StatCard.module.scss';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: string; direction: 'up' | 'down' };
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  subtitle,
}) => (
  <div className={styles.card}>
    <div className={styles.top}>
      <span className={styles.label}>{label}</span>
      <Icon className={styles.icon} size={22} strokeWidth={1.8} />
    </div>
    <div className={styles.value}>{value}</div>
    {trend && (
      <div className={`${styles.trend} ${trend.direction === 'down' ? styles.down : ''}`}>
        {trend.direction === 'up' ? (
          <TrendingUp size={13} strokeWidth={2.5} />
        ) : (
          <TrendingDown size={13} strokeWidth={2.5} />
        )}
        <span>{trend.value} vs last month</span>
      </div>
    )}
    {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
  </div>
);
