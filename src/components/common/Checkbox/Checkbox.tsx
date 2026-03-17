import React, { useEffect, useRef } from 'react';
import { Check, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import styles from './Checkbox.module.scss';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  indeterminate?: boolean;
  label?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  indeterminate,
  checked,
  label,
  className,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = !!indeterminate;
    }
  }, [indeterminate]);

  return (
    <label className={`${styles.checkboxWrapper} ${className || ''}`}>
      <input ref={inputRef} type="checkbox" className={styles.input} checked={checked} {...props} />
      <div
        className={`${styles.checkbox} ${checked ? styles.checked : ''} ${
          indeterminate ? styles.indeterminate : ''
        }`}
      >
        <AnimatePresence mode="wait">
          {indeterminate ? (
            <motion.div
              key="minus"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              <Minus size={14} />
            </motion.div>
          ) : checked ? (
            <motion.div
              key="check"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              <Check size={14} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
};
