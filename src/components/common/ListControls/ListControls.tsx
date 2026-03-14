import React, { useState, useRef, memo } from 'react';
import {
  Search,
  LayoutGrid,
  ChevronDown,
  Check,
  X,
  Command,
  ListFilter,
  StretchHorizontal,
  ArrowDownNarrowWide,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useOnClickOutside } from '../../../hooks/useOnClickOutside';

import styles from './ListControls.module.scss';

export type ViewType = 'grid' | 'table';

export interface SortOption {
  label: string;
  value: string;
}

export interface FilterOption {
  label: string;
  value: string;
}

interface ListControlsProps {
  // Search
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;

  // Filters
  showFilters?: boolean;
  filterCount?: number;
  onFilterClick?: () => void;
  filterOptions?: FilterOption[];
  selectedFilter?: string;
  onFilterChange?: (value: string) => void;
  filterTitle?: string;

  // View Switcher
  showViewSwitcher?: boolean;
  viewType?: ViewType;
  onViewTypeChange?: (view: ViewType) => void;

  // Sort
  showSort?: boolean;
  sortOptions?: SortOption[];
  selectedSort?: string;
  onSortChange?: (value: string) => void;

  // Visibility toggle
  className?: string;
}

export const ListControls: React.FC<ListControlsProps> = memo(
  ({
    showSearch = true,
    searchPlaceholder = 'Search...',
    searchQuery = '',
    onSearchChange,
    showFilters = true,
    filterCount = 0,
    onFilterClick,
    filterOptions = [],
    selectedFilter = '',
    onFilterChange,
    filterTitle = 'Filter',
    showViewSwitcher = true,
    viewType = 'grid',
    onViewTypeChange,
    showSort = true,
    sortOptions = [],
    selectedSort = '',
    onSortChange,
    className = '',
  }) => {
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const sortRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useOnClickOutside(sortRef, () => setIsSortOpen(false));
    useOnClickOutside(filterRef, () => setIsFilterOpen(false));

    const handleSortSelect = (value: string) => {
      onSortChange?.(value);
      setIsSortOpen(false);
    };

    const handleFilterSelect = (value: string) => {
      onFilterChange?.(value);
      setIsFilterOpen(false);
    };

    const handleSearchIconClick = () => {
      inputRef.current?.focus();
    };

    const selectedSortLabel =
      sortOptions.find((option) => option.value === selectedSort)?.label || 'Sort by';

    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.leftSection}>
          {showSearch && (
            <div
              className={`${styles.searchWrapper} ${isSearchFocused ? styles.active : ''}`}
              onClick={handleSearchIconClick}
            >
              <Search size={20} className={styles.searchIcon} />
              <input
                ref={inputRef}
                type="text"
                className={styles.searchInput}
                placeholder={searchPlaceholder}
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
              <div className={styles.searchShortcut}>
                <Command size={18} /> /
              </div>
            </div>
          )}

          {showFilters && (
            <div className={styles.sortDropdown} ref={filterRef}>
              <button
                className={`${styles.actionButton} ${isFilterOpen ? styles.active : ''}`}
                onClick={() => {
                  if (filterOptions.length > 0 && !onFilterClick) {
                    setIsFilterOpen(!isFilterOpen);
                  } else {
                    onFilterClick?.();
                  }
                }}
              >
                <ListFilter size={18} strokeWidth={3} />
                <span>Filters</span>
                {filterCount > 0 && <span className={styles.badge}>{filterCount}</span>}
              </button>

              <AnimatePresence>
                {isFilterOpen && filterOptions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className={styles.dropdownMenu}
                    style={{ left: 0, right: 'auto' }}
                  >
                    <div className={styles.dropdownHeader}>
                      <h4>{filterTitle}</h4>
                      <button onClick={() => setIsFilterOpen(false)}>
                        <X size={18} />
                      </button>
                    </div>
                    {filterOptions.map((option) => (
                      <button
                        key={option.value}
                        className={`${styles.dropdownItem} ${
                          selectedFilter === option.value ? styles.selected : ''
                        }`}
                        onClick={() => handleFilterSelect(option.value)}
                      >
                        <span>{option.label}</span>
                        {selectedFilter === option.value && (
                          <Check size={16} className={styles.checkIcon} />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className={styles.rightSection}>
          {showViewSwitcher && (
            <div className={styles.viewSwitcher}>
              <button
                className={`${styles.viewButton} ${viewType === 'grid' ? styles.active : ''}`}
                onClick={() => onViewTypeChange?.('grid')}
                title="Grid View"
              >
                <LayoutGrid size={20} />
              </button>
              <button
                className={`${styles.viewButton} ${viewType === 'table' ? styles.active : ''}`}
                onClick={() => onViewTypeChange?.('table')}
                title="Table View"
              >
                <StretchHorizontal size={20} />
              </button>
            </div>
          )}

          {showSort && (
            <div className={styles.sortDropdown} ref={sortRef}>
              <button
                className={`${styles.sortButton} ${isSortOpen ? styles.active : ''}`}
                onClick={() => setIsSortOpen(!isSortOpen)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ArrowDownNarrowWide size={18} />
                  <span>{selectedSortLabel}</span>
                </div>
                <ChevronDown
                  size={18}
                  style={{
                    transform: isSortOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </button>

              <AnimatePresence>
                {isSortOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className={styles.dropdownMenu}
                  >
                    <div className={styles.dropdownHeader}>
                      <h4>Sort by</h4>
                      <button onClick={() => setIsSortOpen(false)}>
                        <X size={18} />
                      </button>
                    </div>
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        className={`${styles.dropdownItem} ${
                          selectedSort === option.value ? styles.selected : ''
                        }`}
                        onClick={() => handleSortSelect(option.value)}
                      >
                        <span>{option.label}</span>
                        {selectedSort === option.value && (
                          <Check size={16} className={styles.checkIcon} />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    );
  },
);

ListControls.displayName = 'ListControls';
