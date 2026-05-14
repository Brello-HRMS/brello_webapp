import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';

import { Sidebar } from '../../features/sidebar/Sidebar';
import { SearchModal } from '../../features/search/components/SearchModal/SearchModal';
import { useSearchStore } from '../../features/search/store/search.store';

import { Header } from './Header';
import styles from './MainLayout.module.scss';

export const MainLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { openModal } = useSearchStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        openModal();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [openModal]);

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
      <SearchModal />
    </div>
  );
};
