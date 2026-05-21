import { Search, X } from 'lucide-react';
import React from 'react';

import styles from './SearchInput.module.scss';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, onClear, inputRef }) => {
  return (
    <div className={styles.wrapper}>
      <Search size={18} className={styles.icon} />
      <input
        ref={inputRef}
        type="text"
        className={styles.input}
        placeholder="Search employees, departments…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        spellCheck={false}
        aria-label="Global search"
      />
      {value && (
        <button className={styles.clearButton} onClick={onClear} aria-label="Clear search">
          <X size={16} />
        </button>
      )}
    </div>
  );
};
