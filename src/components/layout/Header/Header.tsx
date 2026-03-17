import {
  Bell,
  ChevronDown,
  ChevronRight,
  Globe,
  LogOut,
  PanelLeftClose,
  PanelRightClose,
  Settings,
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { ThemeCustomizer } from '../../../features/theme/ThemeCustomizer';
import profileAvatar from '../../../assets/image/dummy_profile.png';
import { Popover } from '../../common/Popover';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { useLogout } from '../../../features/auth/api/useLogout';

import styles from './Header.module.scss';

export interface HeaderProps {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarCollapsed }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 601px)');
  const location = useLocation();
  const { mutate: logout } = useLogout();

  const breadcrumbs = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);

    return segments.map((segment: string) => {
      const label = segment.charAt(0).toUpperCase() + segment.slice(1);

      return { label, path: segment };
    });
  }, [location.pathname]);

  const showNotification = useMediaQuery('(min-width: 801px)');
  const showSettings = useMediaQuery('(min-width: 701px)');

  const profileActionItems = [
    ...(!showNotification
      ? [
          {
            icon: <Bell size={16} />,
            title: 'Notification',
            action: () => {
              setIsProfileOpen(false);
            },
          },
        ]
      : []),
    ...(!showSettings
      ? [
          {
            icon: <Settings size={16} />,
            title: 'Setting',
            action: () => {
              setIsProfileOpen(false);
            },
          },
        ]
      : []),
    {
      icon: <LogOut size={16} />,
      title: 'Logout',
      action: () => {
        setIsProfileOpen(false);
        logout();
      },
    },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <button className="icon-button" aria-label="Toggle Navigation" onClick={toggleSidebar}>
          {isSidebarCollapsed ? <PanelRightClose size={20} /> : <PanelLeftClose size={20} />}
        </button>

        {isDesktop && <div className={styles.divider} />}

        <div className={styles.breadcrumbsContainer}>
          {isDesktop && <Globe size={18} className={styles.breadcrumbIcon} />}

          {breadcrumbs.map((crumb: { path: string; label: string }, index: number) => (
            <div key={crumb.path} className={styles.breadcrumbSegment}>
              {index > 0 && <ChevronRight size={16} className={styles.chevronIcon} />}
              <div className={styles.breadcrumbPill}>{crumb.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.actions}>
          <ThemeCustomizer />

          {isDesktop && (
            <>
              {showSettings && (
                <button className={`icon-button ${styles.settingsButton}`} aria-label="Settings">
                  <Settings size={20} />
                </button>
              )}

              {showNotification && (
                <button
                  className={`icon-button ${styles.notificationButton}`}
                  aria-label="Notifications"
                >
                  <div className={styles.notificationWrapper}>
                    <Bell size={20} />
                    <span className={styles.notificationDot} />
                  </div>
                </button>
              )}
            </>
          )}
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
          items={profileActionItems}
        />
      </div>
    </header>
  );
};
