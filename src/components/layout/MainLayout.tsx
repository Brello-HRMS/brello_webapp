import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import { Sidebar } from '../../features/sidebar/Sidebar';

import { Header } from './Header';
import styles from './MainLayout.module.scss';

export const MainLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');

    const handleMediaQueryChange = (event: MediaQueryListEvent | MediaQueryList) => {
      if (event.matches) {
        setIsSidebarCollapsed(true);
      }
    };

    handleMediaQueryChange(mediaQuery);

    mediaQuery.addEventListener('change', handleMediaQueryChange);
    return () => mediaQuery.removeEventListener('change', handleMediaQueryChange);
  }, []);

  return (
    <div className={styles.layout}>
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      <div className={styles.contentWrapper}>
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
