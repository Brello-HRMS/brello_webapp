import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { type SubMenuItem } from '../sidebarConfig';

import styles from './ExpandedSubMenu.module.scss';

interface ExpandedSubMenuProps {
  items: SubMenuItem[];
  isActive: (path: string) => boolean;
}

export const ExpandedSubMenu = ({ items, isActive }: ExpandedSubMenuProps) => (
  <motion.div
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: 'auto', opacity: 1 }}
    exit={{ height: 0, opacity: 0 }}
    className={styles.subMenu}
  >
    {items.map((child) => (
      <Link
        key={child.path}
        to={child.path}
        className={`${styles.subMenuItem} ${isActive(child.path) ? styles.active : ''}`}
      >
        <div className={styles.connector} />
        {child.label}
      </Link>
    ))}
  </motion.div>
);
