import React, { useState } from 'react';
import { Braces } from 'lucide-react';

import { Popover } from '../../../../components/common';
import { useVariableRegistry } from '../../hooks/useLetterTemplates';

import styles from './InsertVariableDropdown.module.scss';

interface InsertVariableDropdownProps {
  onInsert: (key: string) => void;
  className?: string;
}

export const InsertVariableDropdown: React.FC<InsertVariableDropdownProps> = ({
  onInsert,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: response, isLoading } = useVariableRegistry();
  const groups = response?.data || [];

  return (
    <Popover
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      className={`${styles.popoverContainer} ${className || ''}`}
      dropdownClassName={styles.dropdown}
      trigger={
        <button type="button" className={styles.trigger}>
          <Braces size={14} />
          <span>Insert Variable</span>
        </button>
      }
    >
      <div className={styles.variableList}>
        {isLoading && <div className={styles.emptyState}>Loading variables…</div>}
        {!isLoading && groups.length === 0 && (
          <div className={styles.emptyState}>No variables available</div>
        )}
        {groups.map((group) => (
          <div key={group.category} className={styles.group}>
            <div className={styles.groupTitle}>{group.category}</div>
            {group.variables.map((variable) => (
              <button
                key={variable.key}
                type="button"
                className={styles.variableItem}
                title={variable.description}
                onClick={() => {
                  onInsert(variable.key);
                  setIsOpen(false);
                }}
              >
                <span className={styles.variableLabel}>{variable.label}</span>
                <span className={styles.variableKey}>{`{{${variable.key}}}`}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </Popover>
  );
};
