import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { iconMap } from '../../../features/sidebar/utils/iconMapper';
import { Popover } from '../Popover/Popover';

import styles from './IconPicker.module.scss';

export interface IconPickerProps {
  label?: string;
  value?: string | null;
  onChange: (iconName: string | null) => void;
  error?: string;
  placeholder?: string;
}

const ICON_NAMES = Object.keys(iconMap);

export const IconPicker: React.FC<IconPickerProps> = ({
  label,
  value,
  onChange,
  error,
  placeholder = 'Select icon',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const SelectedIcon = value ? iconMap[value] : null;

  const trigger = (
    <button type="button" className={`${styles.trigger} ${error ? styles.hasError : ''}`}>
      <span className={styles.triggerValue}>
        {SelectedIcon ? (
          <>
            <SelectedIcon size={16} className={styles.triggerIcon} />
            <span>{value}</span>
          </>
        ) : (
          <span className={styles.placeholder}>{placeholder}</span>
        )}
      </span>
      <ChevronDown size={16} className={styles.chevron} />
    </button>
  );

  return (
    <div className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}
      <Popover
        trigger={trigger}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        className={styles.popoverContainer}
        dropdownClassName={styles.grid}
      >
        {value && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => {
              onChange(null);
              setIsOpen(false);
            }}
          >
            Clear icon
          </button>
        )}
        {ICON_NAMES.map((name) => {
          const IconComp = iconMap[name];
          const isSelected = name === value;
          return (
            <button
              type="button"
              key={name}
              className={`${styles.iconCell} ${isSelected ? styles.iconCellSelected : ''}`}
              title={name}
              onClick={() => {
                onChange(name);
                setIsOpen(false);
              }}
            >
              <IconComp size={18} />
            </button>
          );
        })}
      </Popover>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};
