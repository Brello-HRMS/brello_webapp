import { useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { type MenuItem } from '../sidebarConfig';

import styles from './NavItem.module.scss';
import { ExpandedSubMenu } from './ExpandedSubMenu';
import { CollapsedHoverSubMenu } from './CollapsedHoverSubMenu';

interface NavItemProps {
  item: MenuItem;
  isCollapsed: boolean;
  isOpen: boolean;
  isActive: (path: string) => boolean;
  isParentActive: (item: MenuItem) => boolean;
  onToggle: (label: string) => void;
  hoveredMenu: string | null;
  setHoveredMenu: (label: string | null) => void;
}

export const NavItem = ({
  item,
  isCollapsed,
  isOpen,
  isActive,
  isParentActive,
  onToggle,
  hoveredMenu,
  setHoveredMenu,
}: NavItemProps) => {
  const navigate = useNavigate();
  const itemRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const hasChildren = !!item.children;

  const handleClick = () => {
    if (hasChildren) {
      onToggle(item.label);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const handleMouseEnter = () => {
    if (isCollapsed) {
      if (itemRef.current) {
        const rect = itemRef.current.getBoundingClientRect();
        setCoords({
          top: rect.top,
          left: rect.right + 8,
        });
      }
      setHoveredMenu(item.label);
    }
  };

  const handleMouseLeave = () => {
    if (isCollapsed) {
      setHoveredMenu(null);
    }
  };

  return (
    <>
      <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} ref={itemRef}>
        <div
          className={`${styles.menuItem} ${isParentActive(item) ? styles.active : ''}`}
          onClick={handleClick}
        >
          <div className={styles.itemIcon}>
            <item.icon size={20} />
          </div>

          {!isCollapsed && (
            <>
              <span className={styles.itemLabel}>{item.label}</span>
              {hasChildren && (
                <ChevronDown className={`${styles.chevron} ${isOpen ? styles.open : ''}`} />
              )}
            </>
          )}
        </div>

        <AnimatePresence>
          {!isCollapsed && isOpen && item.children && (
            <ExpandedSubMenu items={item.children} isActive={isActive} />
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {isCollapsed && hoveredMenu === item.label && hasChildren && (
          <CollapsedHoverSubMenu
            item={item}
            isActive={isActive}
            coords={coords}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        )}
      </AnimatePresence>
    </>
  );
};
