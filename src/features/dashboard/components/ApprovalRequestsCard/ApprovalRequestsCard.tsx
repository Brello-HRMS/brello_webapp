import React from 'react';
import { Star, ChevronRight, CalendarX, CalendarCheck2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import styles from './ApprovalRequestsCard.module.scss';

import type { ApprovalItem } from '../../types/dashboardTypes';

interface ApprovalRequestsCardProps {
  items: ApprovalItem[];
  totalCount: number;
}

const itemIcon = (iconType: ApprovalItem['iconType']) => {
  if (iconType === 'leave') return <CalendarX size={16} strokeWidth={1.8} />;
  return <CalendarCheck2 size={16} strokeWidth={1.8} />;
};

export const ApprovalRequestsCard: React.FC<ApprovalRequestsCardProps> = ({
  items,
  totalCount,
}) => {
  const navigate = useNavigate();

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.iconWrap}>
            <Star size={18} strokeWidth={1.8} />
          </span>
          <div>
            <div className={styles.title}>Approval Requests</div>
            <div className={styles.subtitle}>{totalCount} Requests for your approval</div>
          </div>
        </div>
        <button className={styles.viewAll} onClick={() => navigate('/leave')}>
          View All
        </button>
      </div>

      <div className={styles.list}>
        {items.map((item) => (
          <button key={item.label} className={styles.item} onClick={() => navigate(item.path)}>
            <span className={styles.itemIcon}>{itemIcon(item.iconType)}</span>
            <span className={styles.itemLabel}>
              {item.label} ({item.count})
            </span>
            <ChevronRight size={16} className={styles.chevron} strokeWidth={1.8} />
          </button>
        ))}
      </div>
    </div>
  );
};
