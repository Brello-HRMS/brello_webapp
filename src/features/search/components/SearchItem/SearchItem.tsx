import {
  Briefcase,
  Building2,
  CalendarDays,
  FileText,
  Layers,
  Megaphone,
  Receipt,
  Shield,
  User,
} from 'lucide-react';
import React from 'react';

import styles from './SearchItem.module.scss';

import type { SearchResultItem } from '../../types/search.types';

interface SearchItemProps {
  item: SearchResultItem;
  isSelected: boolean;
  onClick: (item: SearchResultItem) => void;
}

const ENTITY_ICONS: Record<string, React.ReactNode> = {
  employee: <User size={16} />,
  department: <Building2 size={16} />,
  designation: <Briefcase size={16} />,
  client: <Building2 size={16} />,
  project: <Layers size={16} />,
  announcement: <Megaphone size={16} />,
  company_policy: <FileText size={16} />,
  role: <Shield size={16} />,
  holiday: <CalendarDays size={16} />,
  reimbursement: <Receipt size={16} />,
};

export const SearchItem: React.FC<SearchItemProps> = ({ item, isSelected, onClick }) => {
  return (
    <button
      className={`${styles.item} ${isSelected ? styles.selected : ''}`}
      onClick={() => onClick(item)}
      role="option"
      aria-selected={isSelected}
    >
      <span className={styles.iconWrapper}>
        {ENTITY_ICONS[item.entity_type] ?? <User size={16} />}
      </span>
      <span className={styles.content}>
        <span className={styles.title}>{item.title}</span>
        {item.subtitle && <span className={styles.subtitle}>{item.subtitle}</span>}
      </span>
      <span className={styles.type}>{item.entity_type.replace('_', ' ')}</span>
    </button>
  );
};
