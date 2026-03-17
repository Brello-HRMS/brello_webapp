import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Command, Layers } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { MENU_ITEMS, type MenuItem } from './sidebarConfig';
import styles from './Sidebar.module.scss';
import { NavItem } from './components/NavItem';

export interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar = ({ isCollapsed, setIsCollapsed }: SidebarProps) => {
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const location = useLocation();

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
          <div className={styles.searchWrapper}>
            <Search size={24} />
            <input type="text" placeholder="Search" />
            <div className={styles.shortcut}>
              <Command size={18} /> /
            </div>
          </div>
        </div>
      )}

      <nav className={styles.nav}>
        {MENU_ITEMS.map((item) => (
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
        ))}
      </nav>
    </aside>
  );
};
