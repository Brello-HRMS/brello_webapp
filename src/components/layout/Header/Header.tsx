import { Bell, ChevronRight, Globe, PanelLeftClose, Settings } from 'lucide-react';
import React from 'react';

import { ThemeCustomizer } from '../../../features/theme/ThemeCustomizer';
import profileAvatar from '../../../assets/image/dummy_profile.png';

import styles from './Header.module.scss';

export const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <button className={styles.iconButton} aria-label="Toggle Navigation">
          <PanelLeftClose size={20} />
        </button>

        <div className={styles.divider} />

        <div className={styles.breadcrumb}>
          <Globe size={18} className={styles.breadcrumbIcon} />
          <ChevronRight size={16} className={styles.chevronIcon} />
          <span className={styles.breadcrumbText}>Departments</span>
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.actions}>
          <ThemeCustomizer />

          <button className={styles.iconButton} aria-label="Settings">
            <Settings size={20} />
          </button>

          <button className={styles.iconButton} aria-label="Notifications">
            <div className={styles.notificationWrapper}>
              <Bell size={20} />
              <span className={styles.notificationDot} />
            </div>
          </button>
        </div>

        <div className={styles.divider} />

        <div className={styles.profileWidget}>
          <img src={profileAvatar} alt="David Allen" className={styles.avatar} />
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>David Allen</span>
            <span className={styles.profileRole}>HR Manager</span>
          </div>
        </div>
      </div>
    </header>
  );
};
