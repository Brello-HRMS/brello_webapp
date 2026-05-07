import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

import styles from './Select.module.scss';

export interface SelectOption {
  label: string;
  value: string | number;
  description?: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  className?: string;
  labelPrefix?: string;
  menuPosition?: 'top' | 'bottom';
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  className,
  labelPrefix = '',
  menuPosition: manualPosition,
  label,
  error,
  required,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [autoPosition, setAutoPosition] = useState<'top' | 'bottom'>('bottom');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const selectedOption = options.find((opt) => opt.value === value);

  const position = manualPosition || autoPosition;

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()),
  );

  React.useLayoutEffect(() => {
    if (isOpen && !manualPosition && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = 310;
      if (spaceBelow < menuHeight && rect.top > menuHeight) {
        setAutoPosition('top');
      } else {
        setAutoPosition('bottom');
      }
    }
  }, [isOpen, manualPosition]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setSearch('');
        searchRef.current?.focus();
      }, 0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div
      className={`${styles.container} ${error ? styles.hasError : ''} ${
        disabled ? styles.disabled : ''
      } ${className || ''}`}
      ref={containerRef}
    >
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.asterisk}>*</span>}
        </label>
      )}
      <div className={styles.selectContainer}>
        <button
          className={`${styles.selectTrigger} ${isOpen ? styles.active : ''}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          type="button"
          disabled={disabled}
        >
          <span className={styles.selectedLabel}>
            {selectedOption ? `${labelPrefix}${selectedOption.label}` : placeholder}
          </span>
          <ChevronDown size={18} className={`${styles.chevron} ${isOpen ? styles.rotate : ''}`} />
        </button>

        {isOpen && (
          <div className={`${styles.selectMenu} ${styles[position]}`}>
            <div className={styles.searchWrapper}>
              <Search size={14} className={styles.searchIcon} />
              <input
                ref={searchRef}
                className={styles.searchInput}
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onMouseDown={(e) => e.stopPropagation()}
              />
            </div>
            <div className={styles.optionsList}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`${styles.selectOption} ${
                      value === option.value ? styles.selected : ''
                    }`}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                  >
                    <div className={styles.optionContent}>
                      <div className={styles.optionLabel}>{option.label}</div>
                      {option.description && (
                        <div className={styles.optionDescription}>({option.description})</div>
                      )}
                    </div>
                    {value === option.value && <Check size={18} className={styles.checkIcon} />}
                  </div>
                ))
              ) : (
                <div className={styles.noResults}>No results found</div>
              )}
            </div>
          </div>
        )}
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};
