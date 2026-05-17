import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Command, Layers, Loader2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { useSearchStore } from '../search/store/search.store';

import styles from './Sidebar.module.scss';
import { NavItem } from './components/NavItem';
import { useSidebarMenu } from './hooks/useSidebarMenu';
import { getIconComponent } from './utils/iconMapper';

import type { MenuItem } from './sidebarConfig';

export interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar = ({ isCollapsed, setIsCollapsed }: SidebarProps) => {
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const location = useLocation();
  const { data: menuResponse, isLoading, error } = useSidebarMenu();
  const { openModal } = useSearchStore();

  const MENU_ITEMS: MenuItem[] = useMemo(() => {
    if (!menuResponse?.data?.length) return [];
    return menuResponse.data.map((item) => ({
      label: item.label,
      icon: getIconComponent(item.icon),
      path: item.path || undefined,
      actions: item.actions,
      children: item.children?.map((child) => ({
        label: child.label,
        path: child.path || '',
        actions: child.actions,
      })),
    }));
  }, [menuResponse]);

  const toggleMenu = (label: string) => {
    if (isCollapsed) return;
    setOpenMenus((prev) => (prev.includes(label) ? [] : [label]));
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    const currentPath = location.pathname.split('/').slice(0, 3).join('/');
    const targetPath = path.split('/').slice(0, 3).join('/');

    return currentPath === targetPath;
  };

  const isParentActive = (item: MenuItem) => {
    if (item.path && isActive(item.path)) return true;
    return item.children?.some((child) => isActive(child.path)) ?? false;
  };

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : styles.expanded}`}>
      <div className={styles.header}>
        <div
          className={styles.logo}
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{ cursor: 'pointer' }}
        >
          <Layers />
        </div>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.brandName}
          >
            Layers
          </motion.span>
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
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <Loader2
              className="animate-spin"
              size={24}
              style={{ animation: 'spin 1s linear infinite' }}
            />
          </div>
        ) : error ? (
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
            />
          ))
        )}
      </nav>
    </aside>
  );
};
