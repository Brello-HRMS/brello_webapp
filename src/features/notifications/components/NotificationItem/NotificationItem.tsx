import { AlertTriangle, Bell, CheckCircle, FileText, Info, Users, XCircle } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import {
  type Notification,
  type NotificationIconVariant,
  NotificationType,
} from '../../types/notificationTypes';

import styles from './NotificationItem.module.scss';

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  /** Close the notification panel after navigating to the notification's target. */
  onClose?: () => void;
}

const iconMap: Record<NotificationIconVariant, React.ReactNode> = {
  success: <CheckCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  error: <XCircle size={18} />,
  info: <Info size={18} />,
};

const fallbackIconMap: Record<NotificationType, React.ReactNode> = {
  [NotificationType.LEAVE]: <FileText size={18} />,
  [NotificationType.EMPLOYEE]: <Users size={18} />,
  [NotificationType.DOCUMENT]: <FileText size={18} />,
  [NotificationType.PAYROLL]: <CheckCircle size={18} />,
  [NotificationType.APPROVAL]: <CheckCircle size={18} />,
  [NotificationType.ATTENDANCE]: <Bell size={18} />,
};

function formatTime(isoString: string): string {
  // Postgres returns timestamps without 'Z'; append it so JS treats them as UTC, not local
  const date = new Date(isoString.endsWith('Z') ? isoString : `${isoString}Z`);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkRead,
  onClose,
}) => {
  const { id, type, title, message, timestamp, isRead, avatar, iconVariant, link } = notification;
  const navigate = useNavigate();

  const handleClick = () => {
    if (!isRead) onMarkRead(id);
    if (link) {
      navigate(link);
      onClose?.();
    }
  };

  return (
    <div
      className={`${styles.item} ${!isRead ? styles.unread : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={title}
    >
      {!isRead && <span className={styles.unreadIndicator} aria-hidden="true" />}

      <div className={styles.iconWrapper}>
        {avatar ? (
          <img src={avatar} alt="" className={styles.avatar} />
        ) : (
          <div
            className={`${styles.iconCircle} ${iconVariant ? styles[iconVariant] : styles.info}`}
          >
            {iconVariant ? iconMap[iconVariant] : fallbackIconMap[type]}
          </div>
        )}
      </div>

      <div className={styles.content}>
        <p className={styles.title}>{title}</p>
        <p className={styles.message}>{message}</p>
        <span className={styles.time}>{formatTime(timestamp)}</span>
      </div>
    </div>
  );
};
