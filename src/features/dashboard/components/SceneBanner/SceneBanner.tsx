import React from 'react';

import sceneImage from '../../../../assets/svg/1.svg';

import styles from './SceneBanner.module.scss';

export const SceneBanner: React.FC = () => {
  return (
    <div className={styles.wrapper}>
      <img src={sceneImage} alt="Scene Banner" className={styles.image} />
    </div>
  );
};
