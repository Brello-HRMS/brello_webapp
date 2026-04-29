import React from 'react';
import { Package } from 'lucide-react';

import styles from './AssetsCard.module.scss';

import type { AssetItem } from '../../../types/employeeType';

interface AssetsCardProps {
  assets: AssetItem[];
}

export const AssetsCard: React.FC<AssetsCardProps> = ({ assets }) => {
  return (
    <div className={styles.wrapper}>
      <h3 className={styles.sectionTitle}>Asset Assigned</h3>
      {!assets || assets.length === 0 ? (
        <p className={styles.empty}>No assets assigned.</p>
      ) : (
        <div className={styles.chips}>
          {assets.map((asset) => (
            <span key={asset.id} className={styles.chip}>
              <Package size={13} />
              {asset.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
