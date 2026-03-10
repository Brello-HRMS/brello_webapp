import { Outlet } from 'react-router-dom';

import { Sidebar } from '../../features/sidebar/Sidebar';

import { Header } from './Header';
import styles from './MainLayout.module.scss';

export const MainLayout = () => {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.contentWrapper}>
        <Header />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
