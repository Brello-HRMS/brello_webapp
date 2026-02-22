import { Outlet } from 'react-router-dom';

import { ThemeCustomizer } from '../../features/theme/ThemeCustomizer';

import styles from './MainLayout.module.scss';

export const MainLayout = () => {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <div className={styles.brand}>Brello</div>
          <ThemeCustomizer />
        </nav>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        &copy; {new Date().getFullYear()} Brello. All rights reserved.
      </footer>
    </div>
  );
};
