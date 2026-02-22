import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { type MenuItem } from '../sidebarConfig';
import styles from './CollapsedHoverSubMenu.module.scss';

interface CollapsedHoverSubMenuProps {
  item: MenuItem;
  isActive: (path: string) => boolean;
  coords: { top: number; left: number };
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const CollapsedHoverSubMenu = ({
  item,
  isActive,
  coords,
  onMouseEnter,
  onMouseLeave,
}: CollapsedHoverSubMenuProps) => {
  return createPortal(
    <motion.div
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -5 }}
      className={styles.collapsedSubMenu}
      style={{
        position: 'fixed',
        top: coords.top,
        left: coords.left,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {item.children?.map((child) => (
        <Link
          key={child.path}
          to={child.path}
          className={`${styles.subMenuItem} ${isActive(child.path) ? styles.active : ''}`}
        >
          {child.label}
        </Link>
      ))}
    </motion.div>,
    document.body,
  );
};
