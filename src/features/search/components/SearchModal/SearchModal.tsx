import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useDebounce } from '../../../../hooks/useDebounce';
import { useSearch } from '../../hooks/useSearch';
import { useRecentSearches, useSaveRecentSearch } from '../../hooks/useRecentSearches';
import { useSearchStore } from '../../store/search.store';
import { SearchInput } from '../SearchInput/SearchInput';
import { SearchResults } from '../SearchResults/SearchResults';
import { RecentSearches } from '../RecentSearches/RecentSearches';

import styles from './SearchModal.module.scss';

import type { SearchResultItem, RecentSearchItem } from '../../types/search.types';

export const SearchModal: React.FC = () => {
  const { isOpen, closeModal } = useSearchStore();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }

  const debouncedQuery = useDebounce(query, 200);
  const [prevDebouncedQuery, setPrevDebouncedQuery] = useState(debouncedQuery);

  if (debouncedQuery !== prevDebouncedQuery) {
    setPrevDebouncedQuery(debouncedQuery);
    setSelectedIndex(0);
  }

  const hasQuery = debouncedQuery.trim().length > 0;

  const { data: searchData, isFetching } = useSearch(debouncedQuery);
  const { data: recentItems } = useRecentSearches(isOpen && !hasQuery);
  const { mutate: saveRecent } = useSaveRecentSearch();

  const results = useMemo(() => searchData?.data.results ?? [], [searchData?.data.results]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const navigateTo = useCallback(
    (route: string, item?: SearchResultItem) => {
      if (item) {
        saveRecent({
          entity_id: item.entity_id,
          entity_type: item.entity_type,
          title: item.title,
          route: item.route,
        });
      }
      closeModal();
      navigate(route);
    },
    [closeModal, navigate, saveRecent],
  );

  const handleSelectResult = useCallback(
    (item: SearchResultItem) => navigateTo(item.route, item),
    [navigateTo],
  );

  const handleSelectModule = useCallback(
    (route: string) => {
      closeModal();
      navigate(route);
    },
    [closeModal, navigate],
  );

  const handleSelectRecent = useCallback(
    (item: RecentSearchItem) => {
      if (item.route) navigateTo(item.route);
    },
    [navigateTo],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
        return;
      }

      if (!hasQuery || results.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        handleSelectResult(results[selectedIndex]);
      }
    },
    [closeModal, hasQuery, results, selectedIndex, handleSelectResult],
  );

  if (!isOpen) return null;

  return (
    <div
      className={styles.overlay}
      onClick={closeModal}
      role="dialog"
      aria-modal="true"
      aria-label="Global search"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
        <SearchInput
          value={query}
          onChange={(v) => setQuery(v)}
          onClear={() => setQuery('')}
          inputRef={inputRef}
        />

        {isFetching && <div className={styles.loadingBar} />}

        <div className={styles.body}>
          {hasQuery ? (
            searchData && (
              <SearchResults
                data={searchData}
                selectedIndex={selectedIndex}
                onSelect={handleSelectResult}
                onModuleClick={handleSelectModule}
              />
            )
          ) : (
            <RecentSearches items={recentItems?.data ?? []} onSelect={handleSelectRecent} />
          )}
        </div>

        <div className={styles.footer}>
          <span className={styles.hint}>
            <kbd>↑↓</kbd> navigate &nbsp;·&nbsp; <kbd>↵</kbd> open &nbsp;·&nbsp; <kbd>Esc</kbd>{' '}
            close &nbsp;·&nbsp; <kbd>⌘ /</kbd> toggle
          </span>
        </div>
      </div>
    </div>
  );
};
