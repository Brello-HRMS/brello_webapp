import { MoreVertical } from 'lucide-react';

import { AvatarGroup } from '../../../../components/common/AvatarGroup/AvatarGroup';

import styles from './DepartmentCard.module.scss';

export interface DepartmentCardProps {
  name: string;
  code: string;
  status: 'Active' | 'Inactive';
  members: string[];
  icon: string;
  iconBg: string;
  iconColor: string;
  onActionClick?: () => void;
}

export const DepartmentCard: React.FC<DepartmentCardProps> = ({
  name,
  code,
  status,
  members,
  icon,
  iconBg,
  iconColor,
  onActionClick,
}) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconWrapper} style={{ backgroundColor: iconBg, color: iconColor }}>
          <img src={icon} alt={name} width={24} height={24} className={styles.icon} />
        </div>
        <button className={styles.actionButton} onClick={onActionClick}>
          <MoreVertical size={20} />
        </button>
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.code}>Code: {code}</p>
      </div>

      <div className={styles.footer}>
        <AvatarGroup avatars={members} max={3} size={24} />

        <div className={`${styles.statusBadge} ${styles[status.toLowerCase()]}`}>
          <span className={styles.statusDot}></span>
          {status}
        </div>
      </div>
    </div>
  );
};
