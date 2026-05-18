import { Clock } from 'lucide-react';
import React from 'react';

import styles from './RecentSearches.module.scss';

import type { RecentSearchItem } from '../../types/search.types';

interface RecentSearchesProps {
  items: RecentSearchItem[];
  onSelect: (item: RecentSearchItem) => void;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({ items, onSelect }) => {
  if (items?.length === 0) {
    return (
      <div className={styles.empty}>
        <span>No recent searches</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <span className={styles.label}>Recent</span>
      {items?.map((item) => (
        <button key={item.id} className={styles.item} onClick={() => onSelect(item)}>
          <Clock size={14} className={styles.clock} />
          <span className={styles.text}>{item.title ?? item.query ?? '—'}</span>
          {item.entity_type && <span className={styles.type}>{item.entity_type}</span>}
        </button>
      ))}
    </div>
  );
};
