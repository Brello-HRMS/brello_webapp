import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, PanelLeftClose, PanelRightClose } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { useSearchStore } from '../search/store/search.store';
import { isAdminApp } from '../../utils/authUtils';
import { useOrgSetupStatus } from '../dashboard/hooks/useOrgSetupStatus';
import { SETUP_FREE_PATHS } from '../../components/common/SetupGuard/SetupGuard';
import { Logo } from '../../components/common/Logo/Logo';
import { Loader } from '../../components/common/Loader/Loader';

import styles from './Sidebar.module.scss';
import { NavItem } from './components/NavItem';
import { useSidebarMenu } from './hooks/useSidebarMenu';
import { getIconComponent } from './utils/iconMapper';

import type { MenuItem } from './sidebarConfig';

const isPathFree = (path?: string) => !!path && SETUP_FREE_PATHS.some((r) => r.test(path));

const isMenuItemFree = (item: { path?: string; children?: { path: string }[] }) => {
  if (item.path && isPathFree(item.path)) return true;
  if (item.children?.length) return item.children.every((c) => isPathFree(c.path));
  return false;
};

export interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar = ({ isCollapsed, setIsCollapsed }: SidebarProps) => {
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const location = useLocation();
  const { data: menuResponse, isLoading, error } = useSidebarMenu();
  const { data: setupData } = useOrgSetupStatus();
  const { openModal } = useSearchStore();

  const isSetupIncomplete =
    isAdminApp() && setupData != null && setupData.completionPercentage < 100;

  const MENU_ITEMS: MenuItem[] = useMemo(() => {
    if (!menuResponse?.data?.length) return [];
    return menuResponse.data.map((item) => {
      const children = item.children?.map((child) => ({
        label: child.label,
        path: child.path || '',
        actions: child.actions,
      }));

      const menuItem = {
        label: item.label,
        icon: getIconComponent(item.icon),
        path: item.path || undefined,
        actions: item.actions,
        children,
      };

      return {
        ...menuItem,
        isLocked: isSetupIncomplete ? !isMenuItemFree(menuItem) : false,
      };
    });
  }, [menuResponse, isSetupIncomplete]);

  const toggleMenu = (label: string) => {
    if (isCollapsed) return;
    setOpenMenus((prev) => (prev.includes(label) ? [] : [label]));
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isParentActive = (item: MenuItem) => {
    if (item.path && isActive(item.path)) return true;
    return item.children?.some((child) => isActive(child.path)) ?? false;
  };

  const showLoading = isLoading;
  const showError = !!error;

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : styles.expanded}`}>
      <div
        className={styles.header}
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
      >
        <div
          className={styles.logo}
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{ cursor: 'pointer' }}
        >
          <AnimatePresence mode="wait">
            {isCollapsed && isHeaderHovered ? (
              <motion.div
                key="icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                style={{ display: 'flex' }}
              >
                <PanelRightClose size={24} color="#6b7280" />
              </motion.div>
            ) : (
              <motion.div
                key="logo"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                style={{ display: 'flex' }}
              >
                <Logo showWordmark={false} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.brandName}
          >
            Brello
          </motion.span>
        )}
        {!isCollapsed && (
          <button
            aria-label="Toggle Navigation"
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              marginLeft: 'auto',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: '#6b7280',
              padding: '4px',
              borderRadius: '4px',
            }}
          >
            <PanelLeftClose size={20} />
          </button>
        )}
      </div>

      {!isCollapsed && (
        <div className={styles.searchContainer}>
          <button className={styles.searchWrapper} onClick={openModal} aria-label="Open search">
            <Search size={16} />
            <span className={styles.searchPlaceholder}>Search</span>
            <div className={styles.shortcut}>
              <Command size={14} /> /
            </div>
          </button>
        </div>
      )}

      <nav className={styles.nav}>
        {showLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <Loader size="xs" />
          </div>
        ) : showError ? (
          <div style={{ textAlign: 'center', padding: '1rem', color: 'red', fontSize: '14px' }}>
            Failed to load menu
          </div>
        ) : (
          MENU_ITEMS.map((item) => (
            <NavItem
              key={item.label}
              item={item}
              isCollapsed={isCollapsed}
              isOpen={openMenus.includes(item.label)}
              isActive={isActive}
              isParentActive={isParentActive}
              onToggle={toggleMenu}
              hoveredMenu={hoveredMenu}
              setHoveredMenu={setHoveredMenu}
              isLocked={item.isLocked}
            />
          ))
        )}
      </nav>
    </aside>
  );
};
