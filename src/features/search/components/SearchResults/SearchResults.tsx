import React from 'react';

import { SearchItem } from '../SearchItem/SearchItem';

import styles from './SearchResults.module.scss';

import type { SearchResponse, SearchResultItem } from '../../types/search.types';

interface SearchResultsProps {
  data: SearchResponse;
  selectedIndex: number;
  onSelect: (item: SearchResultItem) => void;
  onModuleClick: (route: string) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  data,
  selectedIndex,
  onSelect,
  onModuleClick,
}) => {
  if (data.data.results.length === 0) {
    return (
      <div className={styles.empty}>
        <span>No results found</span>
      </div>
    );
  }

  return (
    <div className={styles.container} role="listbox">
      {data.data.modules.length > 0 && (
        <div className={styles.section}>
          <span className={styles.sectionLabel}>Modules</span>
          <div className={styles.moduleChips}>
            {data.data.modules.map((mod) => (
              <button
                key={mod.route}
                className={styles.moduleChip}
                onClick={() => onModuleClick(mod.route)}
              >
                {mod.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Results</span>
        {data.data.results.map((item, index) => (
          <SearchItem
            key={item.id}
            item={item}
            isSelected={index === selectedIndex}
            onClick={onSelect}
          />
        ))}
      </div>
    </div>
  );
};
