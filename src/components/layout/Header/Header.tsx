import {
  Bell,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Globe,
  LogOut,
  Settings,
} from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate, matchPath } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { adminRoutes } from '../../../routes/adminRoutes';
import { employeeRoutes } from '../../../routes/employeeRoutes';
import { NotificationPanel } from '../../../features/notifications/components/NotificationPanel/NotificationPanel';
import { useUnreadCount } from '../../../features/notifications/hooks/useNotifications';
import profileAvatar from '../../../assets/image/dummy_profile.png';
import { Popover } from '../../common/Popover';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { useLogout } from '../../../features/auth/api/useLogout';
import { getAuthUser } from '../../../utils/authUtils';
import { useEmployeeDetail } from '../../../features/employee/hooks/useEmployeeDetail';

import { AppSwitcher } from './AppSwitcher';
import styles from './Header.module.scss';

const ALL_ROUTES = [...adminRoutes, ...employeeRoutes]
  .map((r) => r.path)
  .filter(Boolean) as string[];

const MODULE_ROOTS: Record<string, string> = {
  organisation: '/organisation/profile',
  'letter-management': '/letter-management/issued-letters',
  employee: '/employee/directory',
  attendance: '/attendance/daily',
  project: '/project/clients',
  payroll: '/payroll/listing',
  reimbursement: '/reimbursement/list',
  announcements: '/announcements/list',
  access: '/access/roles',
  billing: '/billing/plan',
  support: '/support/feedback',
  integration: '/integration/email',
  'offer-management': '/offer-management/candidate',
  'company-structure': '/company-structure',
};

const isValidPath = (pathToCheck: string) => {
  if (pathToCheck === '' || pathToCheck === '/' || pathToCheck === '/dashboard') return true;
  return ALL_ROUTES.some((routePath) =>
    matchPath({ path: `/${routePath}`, end: true }, pathToCheck),
  );
};

export interface HeaderProps {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { data: unreadCount = 0 } = useUnreadCount();
  const isDesktop = useMediaQuery('(min-width: 601px)');
  const location = useLocation();
  const navigate = useNavigate();
  const { mutate: logout } = useLogout();

  const authUser = getAuthUser();
  const { data: employeeResponse } = useEmployeeDetail(authUser?.id);
  const employeeDetails = employeeResponse?.data;

  const fullName = employeeDetails
    ? `${employeeDetails.firstName || ''} ${employeeDetails.lastName || ''}`.trim()
    : authUser
      ? `${authUser.first_name || ''} ${authUser.last_name || ''}`.trim()
      : 'User';

  const designation = employeeDetails?.profile?.designation || 'Employee';

  const avatarUrl = employeeDetails?.avatar || profileAvatar;

  const { breadcrumbs, backPath, hasBack } = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);

    const formatSegment = (segment: string) => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(segment)) {
        return `${segment.substring(0, 8)}...${segment.substring(segment.length - 4)}`;
      }
      return segment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    const allCrumbs = segments.reduce<{ label: string; path: string; isClickable: boolean }[]>(
      (crumbs, segment, index) => {
        let cumulativePath = `/${segments.slice(0, index + 1).join('/')}`;
        let isClickable = isValidPath(cumulativePath);

        // Fallback for module roots that aren't valid explicit routes
        if (!isClickable && index === 0 && MODULE_ROOTS[segment]) {
          cumulativePath = MODULE_ROOTS[segment];
          isClickable = true;
        }

        return [...crumbs, { label: formatSegment(segment), path: cumulativePath, isClickable }];
      },
      [],
    );

    const clickableCrumbs = allCrumbs.filter((c) => c.isClickable);
    const hasBack = clickableCrumbs.length > 1;
    const backPath = hasBack ? clickableCrumbs[clickableCrumbs.length - 2].path : '/dashboard';

    if (allCrumbs.length <= 3) return { breadcrumbs: allCrumbs, backPath, hasBack };

    return {
      breadcrumbs: [
        allCrumbs[0],
        { label: '...', path: '', isClickable: false },
        allCrumbs[allCrumbs.length - 1],
      ],
      backPath,
      hasBack,
    };
  }, [location.pathname]);

  // Prefer real browser history so Back returns the user to wherever they
  // actually came from (e.g. dashboard, global search, a deep link). Only when
  // there is no in-app history (direct load / refresh) do we fall back to the
  // breadcrumb-derived parent path.
  const handleBack = () => {
    if (location.key && location.key !== 'default') {
      navigate(-1);
    } else {
      navigate(backPath);
    }
  };

  const handleCrumbClick = (crumb: { path: string; isClickable: boolean }, isActive: boolean) => {
    if (crumb.isClickable && crumb.path && !isActive) {
      navigate(crumb.path);
    }
  };

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
          <AnimatePresence mode="popLayout">
            {hasBack && (
              <motion.div
                key="back-button"
                initial={{ opacity: 0, width: 0, x: -10 }}
                animate={{ opacity: 1, width: 'auto', x: 0 }}
                exit={{ opacity: 0, width: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}
              >
                <button
                  className="icon-button"
                  aria-label="Go Back"
                  onClick={handleBack}
                  style={{ flexShrink: 0 }}
                >
                  <ChevronLeft size={20} />
                </button>
                {isDesktop && <div className={styles.divider} style={{ flexShrink: 0 }} />}
              </motion.div>
            )}
          </AnimatePresence>

          <div className={styles.breadcrumbsContainer}>
            {isDesktop && <Globe size={18} className={styles.breadcrumbIcon} />}

            <AnimatePresence mode="popLayout">
              {breadcrumbs.map((crumb, index) => {
                const isActive = index === breadcrumbs.length - 1 && crumb.path !== '';
                return (
                  <motion.div
                    key={`${crumb.path}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    className={styles.breadcrumbSegment}
                  >
                    {index > 0 && <ChevronRight size={16} className={styles.chevronIcon} />}
                    {(() => {
                      const isLinkable = crumb.isClickable && crumb.path !== '' && !isActive;
                      return (
                        <div
                          className={`${styles.breadcrumbPill} ${isActive ? styles.active : ''} ${
                            isLinkable ? styles.clickable : ''
                          }`}
                          onClick={() => handleCrumbClick(crumb, isActive)}
                          role={isLinkable ? 'link' : undefined}
                          tabIndex={isLinkable ? 0 : undefined}
                          onKeyDown={(e) => {
                            if (isLinkable && (e.key === 'Enter' || e.key === ' ')) {
                              e.preventDefault();
                              handleCrumbClick(crumb, isActive);
                            }
                          }}
                          style={isLinkable ? { cursor: 'pointer' } : undefined}
                        >
                          {crumb.label}
                        </div>
                      );
                    })()}
                  </motion.div>
                );
              })}
            </AnimatePresence>
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
                    aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                    onClick={() => setIsNotificationOpen(true)}
                  >
                    <div className={styles.notificationWrapper}>
                      <Bell size={20} />
                      {unreadCount > 0 && <span className={styles.notificationDot} />}
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
