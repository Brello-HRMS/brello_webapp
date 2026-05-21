import React from 'react';
import { Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import styles from './AnnouncementCard.module.scss';

interface AnnouncementCardProps {
  todayCount: number;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ todayCount }) => {
  const navigate = useNavigate();

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.iconWrap}>
            <Megaphone size={18} strokeWidth={1.8} />
          </span>
          <div>
            <div className={styles.title}>Announcement</div>
            <div className={styles.subtitle}>{todayCount} Today</div>
          </div>
        </div>
        <button className={styles.viewAll} onClick={() => navigate('/announcements')}>
          View All
        </button>
      </div>

      {todayCount === 0 && <div className={styles.empty}>No Announcement</div>}
    </div>
  );
};
