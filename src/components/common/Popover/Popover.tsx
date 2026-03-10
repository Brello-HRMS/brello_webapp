import React, { type ReactNode, useRef } from 'react';

import { useOnClickOutside } from '../../../hooks/useOnClickOutside';

import styles from './Popover.module.scss';

export interface PopoverAction {
  icon?: ReactNode;
  title: string;
  action: () => void;
  color?: string;
  className?: string;
}

export interface PopoverProps {
  trigger: ReactNode;
  items?: PopoverAction[];
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  className?: string;
  dropdownClassName?: string;
  children?: ReactNode;
}

export const Popover: React.FC<PopoverProps> = ({
  trigger,
  items,
  isOpen,
  setIsOpen,
  className = '',
  dropdownClassName = '',
  children,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(popoverRef, (_e) => {
    if (isOpen) {
      setIsOpen(false);
    }
  });

  return (
    <div className={`${styles.popoverContainer} ${className}`} ref={popoverRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div className={`${styles.popoverMenu} ${dropdownClassName}`}>
          {items?.map((item, index) => (
            <button
              key={index}
              className={`${styles.menuItem} ${item.className || ''}`.trim()}
              onClick={(e) => {
                e.stopPropagation();
                item.action();
                setIsOpen(false);
              }}
              style={item.color ? { color: item.color } : {}}
            >
              {item.icon && <span className={styles.iconWrapper}>{item.icon}</span>}
              <span className={styles.label}>{item.title}</span>
            </button>
          ))}
          {children}
        </div>
      )}
    </div>
  );
};
