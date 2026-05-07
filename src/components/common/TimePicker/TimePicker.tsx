import React, { useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';

import styles from './TimePicker.module.scss';

interface TimePickerProps {
  label?: string;
  value: string; // "HH:mm" 24h format
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
}

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const PERIODS = ['AM', 'PM'];

function parse24h(value: string): { hour: string; minute: string; period: string } {
  if (!value) return { hour: '09', minute: '00', period: 'AM' };
  const [hStr, mStr] = value.split(':');
  const h24 = parseInt(hStr, 10);
  const period = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return {
    hour: String(h12).padStart(2, '0'),
    minute: String(parseInt(mStr || '0', 10)).padStart(2, '0'),
    period,
  };
}

function to24h(hour: string, minute: string, period: string): string {
  let h = parseInt(hour, 10);
  if (period === 'AM') {
    if (h === 12) h = 0;
  } else {
    if (h !== 12) h += 12;
  }
  return `${String(h).padStart(2, '0')}:${minute}`;
}

const ScrollColumn: React.FC<{
  items: string[];
  selected: string;
  onSelect: (v: string) => void;
}> = ({ items, selected, onSelect }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = items.indexOf(selected);
    if (idx >= 0) {
      el.scrollTop = idx * 40;
    }
  }, [selected, items]);

  return (
    <div className={styles.scrollArea} ref={scrollRef}>
      {items.map((item) => (
        <div
          key={item}
          className={`${styles.option} ${item === selected ? styles.selected : ''}`}
          onClick={() => onSelect(item)}
        >
          {item}
        </div>
      ))}
    </div>
  );
};

export const TimePicker: React.FC<TimePickerProps> = ({
  label,
  value,
  onChange,
  required,
  error,
}) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { hour, minute, period } = parse24h(value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (h: string, m: string, p: string) => {
    onChange(to24h(h, m, p));
  };

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.asterisk}>*</span>}
        </label>
      )}
      <div
        className={`${styles.trigger} ${open ? styles.open : ''} ${error ? styles.hasError : ''}`}
        onClick={() => setOpen((v) => !v)}
      >
        {value ? (
          <span className={styles.triggerValue}>
            {hour}:{minute} {period}
          </span>
        ) : (
          <span className={styles.triggerPlaceholder}>Select time</span>
        )}
        <span className={styles.triggerIcon}>
          <Clock size={16} />
        </span>
      </div>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.columns}>
            <div className={styles.column}>
              <div className={styles.columnHeader}>{hour}</div>
              <ScrollColumn
                items={HOURS}
                selected={hour}
                onSelect={(h) => handleChange(h, minute, period)}
              />
            </div>
            <div className={styles.column}>
              <div className={styles.columnHeader}>{minute}</div>
              <ScrollColumn
                items={MINUTES}
                selected={minute}
                onSelect={(m) => handleChange(hour, m, period)}
              />
            </div>
            <div className={styles.column}>
              <div className={styles.columnHeader}>{period}</div>
              <ScrollColumn
                items={PERIODS}
                selected={period}
                onSelect={(p) => handleChange(hour, minute, p)}
              />
            </div>
          </div>
        </div>
      )}
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};

export default TimePicker;
