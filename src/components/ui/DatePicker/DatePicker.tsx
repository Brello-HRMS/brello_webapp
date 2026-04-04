import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import styles from './DatePicker.module.scss';

interface DatePickerProps {
  label?: string;
  required?: boolean;
  error?: string;
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  inline?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  required,
  error,
  value,
  onChange,
  placeholder = 'Select date',
  className,
  inline = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState<'left' | 'right'>('left');
  const [vPlacement, setVPlacement] = useState<'top' | 'bottom'>('bottom');
  const [currentDate, setCurrentDate] = useState(() => {
    if (value) {
      const [y, m, d] = value.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const trackPosition = () => {
      if (isOpen && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const spaceRight = window.innerWidth - rect.left;
        const spaceBottom = window.innerHeight - rect.bottom;

        if (spaceRight < 300) {
          setPlacement('right');
        } else {
          setPlacement('left');
        }

        if (spaceBottom < 350) {
          setVPlacement('top');
        } else {
          setVPlacement('bottom');
        }
      }
    };

    trackPosition();
    window.addEventListener('resize', trackPosition);
    return () => window.removeEventListener('resize', trackPosition);
  }, [isOpen]);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateSelect = (day: number) => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${y}-${m}-${d}`);
    if (!inline) setIsOpen(false);
  };

  const parseLocalDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const formatDisplayDate = (dateStr: string | undefined) => {
    if (!dateStr) return '';
    const date = parseLocalDate(dateStr);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const generateDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const prevMonthDays = daysInMonth(year, month - 1);

    const days = [];

    // Prior month days
    for (let i = startDay - 1; i >= 0; i--) {
      days.push({ day: prevMonthDays - i, type: 'otherMonth' });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({ day: i, type: 'current' });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ day: i, type: 'otherMonth' });
    }

    return days;
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const calendarGrid = (
    <div
      className={`${styles.calendarContainer} ${inline ? styles.inline : `${styles[placement]} ${styles[vPlacement]}`}`}
    >
      <div className={styles.calendarHeader}>
        <button type="button" onClick={handlePrevMonth} className={styles.navBtn}>
          <ChevronLeft size={20} />
        </button>
        <span className={styles.currentMonth}>
          {monthName} {year}
        </span>
        <button type="button" onClick={handleNextMonth} className={styles.navBtn}>
          <ChevronRight size={20} />
        </button>
      </div>

      <div className={styles.weekDays}>
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentDate.toISOString()}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className={styles.daysGrid}
        >
          {generateDays().map((date, index) => {
            const isToday =
              date.type === 'current' &&
              date.day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();

            const isSelected =
              value &&
              date.type === 'current' &&
              (() => {
                const parsed = parseLocalDate(value);
                return (
                  parsed.getDate() === date.day &&
                  parsed.getMonth() === currentDate.getMonth() &&
                  parsed.getFullYear() === currentDate.getFullYear()
                );
              })();

            return (
              <div
                key={index}
                className={`${styles.dayCell} ${date.type === 'otherMonth' ? styles.otherMonth : ''} ${isToday ? styles.today : ''} ${isSelected ? styles.selected : ''}`}
                onClick={() => date.type === 'current' && handleDateSelect(date.day)}
              >
                {date.day}
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  return (
    <div
      className={`${styles.container} ${error ? styles.hasError : ''} ${className || ''}`}
      ref={containerRef}
    >
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.asterisk}>*</span>}
        </label>
      )}
      {inline ? (
        calendarGrid
      ) : (
        <div className={styles.datePickerWrapper}>
          <button
            ref={triggerRef}
            type="button"
            className={`${styles.dateTrigger} ${isOpen ? styles.active : ''}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className={!value ? styles.placeholder : ''}>
              {value ? formatDisplayDate(value) : placeholder}
            </span>
            <CalendarIcon size={18} className={styles.icon} />
          </button>

          <AnimatePresence>{isOpen && calendarGrid}</AnimatePresence>
        </div>
      )}
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};
