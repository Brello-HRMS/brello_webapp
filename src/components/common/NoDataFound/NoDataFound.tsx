import React from 'react';
import { Plus } from 'lucide-react';

import styles from './NoDataFound.module.scss';

export interface NoDataFoundProps {
  title: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
  noDataImage: string;
  noDataImageAlt: string;
  showButtonIcon?: boolean;
}

export const NoDataFound: React.FC<NoDataFoundProps> = ({
  title,
  description,
  buttonText,
  onButtonClick,
  noDataImage,
  noDataImageAlt,
  showButtonIcon = true,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.imageWrapper}>
        <img src={noDataImage} alt={noDataImageAlt} className={styles.image} />
      </div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      {buttonText && onButtonClick && (
        <button className={styles.actionButton} onClick={onButtonClick}>
          {showButtonIcon && <Plus size={20} className={styles.buttonIcon} />}
          <span>{buttonText}</span>
        </button>
      )}
    </div>
  );
};
