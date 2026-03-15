import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

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
  menuPosition?: 'top' | 'bottom'; // Still allowed as an override
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  className,
  labelPrefix = '',
  menuPosition: manualPosition,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [autoPosition, setAutoPosition] = useState<'top' | 'bottom'>('bottom');
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((opt) => opt.value === value);

  // Use manual position if provided, otherwise use calculated auto position
  const position = manualPosition || autoPosition;

  React.useLayoutEffect(() => {
    if (isOpen && !manualPosition && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = 310; // Max height (300) + gap (10)

      if (spaceBelow < menuHeight && rect.top > menuHeight) {
        setAutoPosition('top');
      } else {
        setAutoPosition('bottom');
      }
    }
  }, [isOpen, manualPosition]);

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
    <div className={`${styles.selectContainer} ${className || ''}`} ref={containerRef}>
      <button
        className={`${styles.selectTrigger} ${isOpen ? styles.active : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className={styles.selectedLabel}>
          {selectedOption ? `${labelPrefix}${selectedOption.label}` : placeholder}
        </span>
        <ChevronDown size={18} className={`${styles.chevron} ${isOpen ? styles.rotate : ''}`} />
      </button>

      {isOpen && (
        <div className={`${styles.selectMenu} ${styles[position]}`}>
          {options.map((option) => (
            <div
              key={option.value}
              className={`${styles.selectOption} ${value === option.value ? styles.selected : ''}`}
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
          ))}
        </div>
      )}
    </div>
  );
};
