import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Command, Layers, ChevronsLeft } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { MENU_ITEMS, type MenuItem } from './sidebarConfig';
import styles from './Sidebar.module.scss';
import { NavItem } from './components/NavItem';

export const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');

    const handleMediaQueryChange = (event: MediaQueryListEvent | MediaQueryList) => {
      if (event.matches) {
        setIsCollapsed(true);
      }
    };

    handleMediaQueryChange(mediaQuery);

    mediaQuery.addEventListener('change', handleMediaQueryChange);
    return () => mediaQuery.removeEventListener('change', handleMediaQueryChange);
  }, []);

  const toggleMenu = (label: string) => {
    if (isCollapsed) return;
    setOpenMenus((prev) => (prev.includes(label) ? [] : [label]));
  };

  const isActive = (path?: string) => (path ? location.pathname === path : false);

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
        {!isCollapsed && (
          <div onClick={() => setIsCollapsed(!isCollapsed)} className={styles.collapseBtn}>
            <ChevronsLeft size={20} />
          </div>
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
