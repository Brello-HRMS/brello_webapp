import { Outlet } from 'react-router-dom';

import { Sidebar } from '../../features/sidebar/Sidebar';
import { ThemeCustomizer } from '../../features/theme/ThemeCustomizer';

import styles from './MainLayout.module.scss';

export const MainLayout = () => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.contentWrapper}>
        <header className={styles.header}>
          <nav className={styles.nav}>
            <div className={styles.headerInfo}>
              <div className={styles.title}>Welcome back, Adam!</div>
              <div className={styles.subtitle}>Here's what's happening today.</div>
            </div>
            <div className={styles.headerActions}>
              <ThemeCustomizer />
            </div>
          </nav>
        </header>
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
