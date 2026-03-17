import React, { type ReactNode } from 'react';

import styles from './PageHeader.module.scss';

export interface PageHeaderProps {
  title: string;
  titleExtra?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, titleExtra, subtitle, actions }) => {
  return (
    <div className={styles.headerContainer}>
      <div className={styles.titleSection}>
        <div className={styles.titleWrapper}>
          <h1 className={styles.title}>{title}</h1>
          {titleExtra && <div className={styles.titleExtra}>{titleExtra}</div>}
        </div>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
};
