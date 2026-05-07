import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { ChevronDown, Check, X, Search } from 'lucide-react';

import styles from './MultiSelect.module.scss';

export interface MultiSelectOption {
  label: string;
  value: string | number;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: (string | number)[];
  onChange: (value: (string | number)[]) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select options...',
  label,
  required,
  disabled,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [maxVisibleTags, setMaxVisibleTags] = useState(2);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    const calculateMaxTags = () => {
      if (triggerRef.current) {
        const containerWidth = triggerRef.current.offsetWidth;
        const availableWidth = containerWidth - 80;
        const estimatedMax = Math.floor(availableWidth / 80);
        setMaxVisibleTags(Math.max(1, estimatedMax));
      }
    };

    calculateMaxTags();
    const observer = new ResizeObserver(calculateMaxTags);
    if (triggerRef.current) observer.observe(triggerRef.current);

    return () => observer.disconnect();
  }, [value.length]);

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

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleOption = (val: string | number) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const removeValue = (val: string | number) => {
    onChange(value.filter((v) => v !== val));
  };

  return (
    <div className={`${styles.container} ${disabled ? styles.disabled : ''}`} ref={containerRef}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.asterisk}>*</span>}
        </label>
      )}
      <div className={styles.selectContainer}>
        <div
          ref={triggerRef}
          className={`${styles.trigger} ${isOpen ? styles.active : ''} ${error ? styles.error : ''}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className={styles.selectedContainer}>
            {value.length === 0 && <span className={styles.placeholder}>{placeholder}</span>}
            {value.slice(0, maxVisibleTags).map((v) => {
              const option = options.find((opt) => opt.value === v);
              return (
                <span key={v} className={styles.tag}>
                  {option?.label || v}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeValue(v);
                      }}
                      className={styles.tagRemove}
                    >
                      <X size={12} />
                    </button>
                  )}
                </span>
              );
            })}
            {value.length > maxVisibleTags && (
              <span className={styles.moreBadge}>+{value.length - maxVisibleTags}</span>
            )}
          </div>
          <ChevronDown size={18} className={`${styles.chevron} ${isOpen ? styles.rotate : ''}`} />
        </div>

        {isOpen && (
          <div className={styles.menu}>
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
                filteredOptions.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <div
                      key={option.value}
                      className={`${styles.option} ${isSelected ? styles.selected : ''}`}
                      onClick={() => toggleOption(option.value)}
                    >
                      <div className={styles.checkbox}>
                        {isSelected && <Check size={14} color="#fff" />}
                      </div>
                      <span className={styles.optionLabel}>{option.label}</span>
                    </div>
                  );
                })
              ) : (
                <div className={styles.noOptions}>No results found</div>
              )}
            </div>
          </div>
        )}
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};
