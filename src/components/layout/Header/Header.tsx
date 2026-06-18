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

import { NotificationPanel } from '../../../features/notifications/components/NotificationPanel/NotificationPanel';
import profileAvatar from '../../../assets/image/dummy_profile.png';
import { Popover } from '../../common/Popover';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { useLogout } from '../../../features/auth/api/useLogout';
import { getAuthUser } from '../../../utils/authUtils';
import { useGetUserById } from '../../../features/users/hooks/useGetUserById';

import { AppSwitcher } from './AppSwitcher';
import styles from './Header.module.scss';

export interface HeaderProps {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarCollapsed }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 601px)');
  const location = useLocation();
  const { mutate: logout } = useLogout();

  const authUser = getAuthUser();
  const { data: userDetails } = useGetUserById(authUser?.id);

  const fullName = userDetails
    ? `${userDetails.first_name || ''} ${userDetails.last_name || ''}`.trim()
    : authUser
      ? `${authUser.first_name || ''} ${authUser.last_name || ''}`.trim()
      : 'User';

  const designation = userDetails?.designation?.title || 'Employee';

  const photo = userDetails?.user_profile?.photo;
  const avatarUrl = photo
    ? `https://${photo.bucket}.s3.us-east-1.amazonaws.com/${photo.object_key}`
    : profileAvatar;

  const breadcrumbs = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);

    const truncateId = (id: string, startChars = 8, endChars = 8) => {
      if (id.length > 20 && id.includes('-')) {
        return `${id.substring(0, startChars)}...${id.substring(id.length - endChars)}`;
      }
      return id.charAt(0).toUpperCase() + id.slice(1);
    };

    const allCrumbs = segments.reduce<{ label: string; path: string }[]>((crumbs, segment) => {
      const cumulativePath = `${crumbs.length > 0 ? crumbs[crumbs.length - 1].path : ''}/${segment}`;
      return [...crumbs, { label: truncateId(segment), path: cumulativePath }];
    }, []);

    if (allCrumbs.length <= 4) return allCrumbs;

    return [allCrumbs[0], { label: '...', path: '' }, ...allCrumbs.slice(-2)];
  }, [location.pathname]);

  const showNotification = useMediaQuery('(min-width: 801px)');
  const showSettings = useMediaQuery('(min-width: 701px)');

  const profileActionItems = [
    ...(!showNotification
      ? [
          {
            icon: <Bell size={16} />,
            title: 'Notification',
            action: () => setIsProfileOpen(false),
          },
        ]
      : []),
    ...(!showSettings
      ? [
          {
            icon: <Settings size={16} />,
            title: 'Setting',
            action: () => setIsProfileOpen(false),
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
    <>
      <header className={styles.header}>
        <div className={styles.leftSection}>
          <button className="icon-button" aria-label="Toggle Navigation" onClick={toggleSidebar}>
            {isSidebarCollapsed ? <PanelRightClose size={20} /> : <PanelLeftClose size={20} />}
          </button>

          {isDesktop && <div className={styles.divider} />}

          <div className={styles.breadcrumbsContainer}>
            {isDesktop && <Globe size={18} className={styles.breadcrumbIcon} />}

            {breadcrumbs.map((crumb, index) => {
              const isActive = index === breadcrumbs.length - 1 && crumb.path !== '';
              return (
                <div key={`${crumb.path}-${index}`} className={styles.breadcrumbSegment}>
                  {index > 0 && <ChevronRight size={16} className={styles.chevronIcon} />}
                  <div className={`${styles.breadcrumbPill} ${isActive ? styles.active : ''}`}>
                    {crumb.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.rightSection}>
          <div className={styles.actions}>
            <AppSwitcher />
            {/* <ThemeCustomizer /> */}

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
                    onClick={() => setIsNotificationOpen(true)}
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
                <img src={avatarUrl} alt={fullName} className={styles.avatar} />
                <div className={styles.profileInfo}>
                  <span className={styles.profileName}>{fullName}</span>
                  <span className={styles.profileRole}>{designation}</span>
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

      <NotificationPanel isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
    </>
  );
};
