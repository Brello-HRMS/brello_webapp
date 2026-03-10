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
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { ThemeCustomizer } from '../../../features/theme/ThemeCustomizer';
import profileAvatar from '../../../assets/image/dummy_profile.png';
import { Popover } from '../../common/Popover';
import { useMediaQuery } from '../../../hooks/useMediaQuery';

import styles from './Header.module.scss';

export interface HeaderProps {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarCollapsed }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 601px)');
  const location = useLocation();

  const pathname = location.pathname.split('/').filter(Boolean);
  const lastPathname = pathname[pathname.length - 1];
  const breadcrumbText = lastPathname.charAt(0).toUpperCase() + lastPathname.slice(1);

  const profileActionItems = [
    ...(!isDesktop
      ? [
          {
            icon: <Bell size={16} />,
            title: 'Notification',
            action: () => {
              setIsProfileOpen(false);
            },
          },
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
      },
    },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        <button className="icon-button" aria-label="Toggle Navigation" onClick={toggleSidebar}>
          {isSidebarCollapsed ? <PanelRightClose size={20} /> : <PanelLeftClose size={20} />}
        </button>

        <div className={styles.divider} />

        <div className={styles.breadcrumb}>
          <Globe size={18} className={styles.breadcrumbIcon} />
          <ChevronRight size={16} className={styles.chevronIcon} />
          <span className={styles.breadcrumbText}>{breadcrumbText}</span>
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.actions}>
          <ThemeCustomizer />

          {isDesktop && (
            <>
              <button className={`icon-button`} aria-label="Settings">
                <Settings size={20} />
              </button>

              <button className={`icon-button`} aria-label="Notifications">
                <div className={styles.notificationWrapper}>
                  <Bell size={20} />
                  <span className={styles.notificationDot} />
                </div>
              </button>
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
