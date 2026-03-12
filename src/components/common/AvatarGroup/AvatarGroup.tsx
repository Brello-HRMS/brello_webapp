import React from 'react';

import styles from './AvatarGroup.module.scss';

interface AvatarGroupProps {
  avatars: string[];
  max?: number;
  size?: number;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({ avatars, max = 3, size = 24 }) => {
  const displayAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={styles.avatarGroup}>
      {displayAvatars.map((src, index) => (
        <div
          key={index}
          className={styles.avatarWrapper}
          style={{
            zIndex: displayAvatars.length - index,
            width: `${size}px`,
            height: `${size}px`,
          }}
        >
          <img src={src} alt="Member" className={styles.avatarImage} />
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={styles.remainingCount}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            fontSize: `${size * 0.4}px`,
          }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};
