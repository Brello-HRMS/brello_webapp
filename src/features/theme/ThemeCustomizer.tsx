import { useState } from 'react';
import { Moon } from 'lucide-react';

import { COLOR_LABELS } from './constants';
import { useTheme } from './useTheme';
import styles from './ThemeCustomizer.module.scss';

const CloseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const ThemeCustomizer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, updateColor, resetTheme, hasCustomTheme } = useTheme();

  return (
    <>
      <button
        className={styles.toggleButton}
        onClick={() => setIsOpen(true)}
        title="Customize theme"
        aria-label="Open theme customizer"
      >
        <Moon size={20} />
      </button>

      {isOpen && (
        <>
          <div className={styles.overlay} onClick={() => setIsOpen(false)} />
          <aside className={styles.panel} role="dialog" aria-label="Theme customizer">
            <div className={styles.panelHeader}>
              <h2>Theme Colors</h2>
              <button
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
                aria-label="Close theme customizer"
              >
                <CloseIcon />
              </button>
            </div>

            <div className={styles.panelBody}>
              {Object.entries(COLOR_LABELS).map(([cssVar, label]) => (
                <div key={cssVar} className={styles.colorRow}>
                  <span className={styles.colorLabel}>{label}</span>
                  <input
                    type="color"
                    className={styles.colorInput}
                    value={theme[cssVar]}
                    onChange={(e) => updateColor(cssVar, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className={styles.panelFooter}>
              <button
                className={styles.resetButton}
                onClick={resetTheme}
                disabled={!hasCustomTheme}
              >
                Reset to Default
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
};
