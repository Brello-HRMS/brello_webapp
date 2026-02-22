import { useState } from 'react';

import { COLOR_LABELS } from './constants';
import { useTheme } from './useTheme';
import styles from './ThemeCustomizer.module.scss';

const PaletteIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.68-.76 1.68-1.68 0-.44-.16-.84-.44-1.15a1.67 1.67 0 0 1-.44-1.15c0-.93.75-1.68 1.68-1.68H16a6 6 0 0 0 6-6c0-5.52-4.48-10-10-10Z" />
  </svg>
);

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
        <PaletteIcon />
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
