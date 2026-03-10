import {
  Bell,
  ChevronDown,
  ChevronRight,
  Globe,
  LogOut,
  PanelLeftClose,
  Settings,
} from 'lucide-react';
import React, { useState } from 'react';

import { ThemeCustomizer } from '../../../features/theme/ThemeCustomizer';
import profileAvatar from '../../../assets/image/dummy_profile.png';
import { Popover } from '../../common/Popover';

import styles from './Header.module.scss';

export const Header: React.FC = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <button className="icon-button" aria-label="Toggle Navigation">
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

          <button className={`icon-button ${styles.desktopOnlyAction}`} aria-label="Settings">
            <Settings size={20} />
          </button>

          <button className={`icon-button ${styles.desktopOnlyAction}`} aria-label="Notifications">
            <div className={styles.notificationWrapper}>
              <Bell size={20} />
              <span className={styles.notificationDot} />
            </div>
          </button>
        </div>

        <Popover
          isOpen={isProfileOpen}
          setIsOpen={setIsProfileOpen}
          trigger={
            <div
              className={styles.profileWidget}
              aria-expanded={isProfileOpen}
              aria-haspopup="true"
            >
              <img src={profileAvatar} alt="David Allen" className={styles.avatar} />
              <div className={styles.profileInfo}>
                <span className={styles.profileName}>David Allen</span>
                <span className={styles.profileRole}>HR Manager</span>
              </div>
              <ChevronDown
                size={20}
                className={`${styles.profileChevron} ${isProfileOpen ? styles.isOpen : ''}`}
              />
            </div>
          }
          items={[
            {
              icon: <Bell size={16} />,
              title: 'Notification',
              action: () => {
                setIsProfileOpen(false);
              },
              className: styles.mobileOnlyItem,
            },
            {
              icon: <Settings size={16} />,
              title: 'Setting',
              action: () => {
                setIsProfileOpen(false);
              },
              className: styles.mobileOnlyItem,
            },
            {
              icon: <LogOut size={16} />,
              title: 'Logout',
              action: () => {
                setIsProfileOpen(false);
              },
            },
          ]}
        />
      </div>
    </header>
  );
};
