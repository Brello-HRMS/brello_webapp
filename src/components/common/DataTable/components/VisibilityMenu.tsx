import React from 'react';
import { Settings2, X } from 'lucide-react';

import styles from '../DataTable.module.scss';

import type { Table } from '@tanstack/react-table';

interface VisibilityMenuProps<TData> {
  table: Table<TData>;
}

export const VisibilityMenu = <TData,>({ table }: VisibilityMenuProps<TData>) => {
  const [showVisibilityMenu, setShowVisibilityMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowVisibilityMenu(false);
      }
    };

    if (showVisibilityMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVisibilityMenu]);

  return (
    <div className={styles.visibilityToggle} ref={menuRef}>
      <button
        className={styles.controlButton}
        onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
      >
        <Settings2 size={16} />
        <span>Columns</span>
      </button>

      {showVisibilityMenu && (
        <div className={styles.visibilityMenu}>
          <div className={styles.menuHeader}>
            <span>Toggle Columns</span>
            <button className={styles.closeMenuButton} onClick={() => setShowVisibilityMenu(false)}>
              <X size={16} />
            </button>
          </div>
          <div className={styles.menuList}>
            {table.getAllLeafColumns().map((column) => {
              if (!column.getCanHide()) return null;
              const header = column.columnDef.header;
              const label = typeof header === 'string' ? header : column.id;
              const isVisible = column.getIsVisible();

              return (
                <div
                  key={column.id}
                  className={`${styles.menuItem} ${isVisible ? styles.active : ''}`}
                  onClick={() => column.toggleVisibility(!isVisible)}
                >
                  <div className={styles.menuItemLeft}>
                    <input
                      type="checkbox"
                      checked={isVisible}
                      readOnly
                      className={styles.menuCheckbox}
                    />
                    <span className={styles.columnLabel}>{label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
