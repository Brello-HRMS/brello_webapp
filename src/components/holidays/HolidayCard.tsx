import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Calendar as CalendarIcon, RefreshCw, Trash2 } from 'lucide-react';
import moment from 'moment';

import { ToggleButton } from '../common/ToggleButton/ToggleButton';

import styles from './HolidayCard.module.scss';

import type { Calendar } from '../../types/holiday';

interface HolidayCardProps {
  calendar: Calendar;
  onEdit: (calendar: Calendar) => void;
  onDelete: (id: string) => void;
  onActivate: (id: string) => void;
}

export const HolidayCard: React.FC<HolidayCardProps> = ({ calendar, onDelete, onActivate }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/attendance/holidays/${calendar.id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(calendar.id);
  };

  const handleClone = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement clone
  };

  const isActive = calendar.status === 'ACTIVE' || calendar.is_active;

  return (
    <div className={`${styles.card} ${isActive ? styles.active : ''}`} onClick={handleCardClick}>
      <div className={styles.topRow}>
        <div className={styles.countryInfo}>
          <span>🇮🇳</span>
          <span>{calendar.name.replace(/ - \d{4}$/, '')}</span>
        </div>
        <div className={`${styles.badge} ${isActive ? styles.active : styles.inactive}`}>
          {isActive ? 'Active' : 'Inactive'}
        </div>
      </div>

      <h2 className={styles.year}>{calendar.year}</h2>

      <div className={styles.middleContent}>
        <div className={styles.statItem}>
          <CalendarIcon size={18} />
          <span>{calendar.holiday_count || 0} Holidays scheduled</span>
        </div>
        <div className={styles.statItem}>
          <RefreshCw size={18} />
          <span>Modified {moment(calendar.updated_at).fromNow()}</span>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.bottomRow}>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={handleClone} title="Clone Calendar">
            <Copy size={20} />
          </button>
          <button
            className={`${styles.actionBtn} ${styles.delete}`}
            onClick={handleDelete}
            title="Delete Calendar"
          >
            <Trash2 size={20} />
          </button>
        </div>
        <div className={styles.statusToggle} onClick={(e) => e.stopPropagation()}>
          <ToggleButton checked={isActive} onChange={() => onActivate(calendar.id)} />
        </div>
      </div>
    </div>
  );
};
