import { BookCheck } from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { Dialog } from '../../../../components/common/Dialog/Dialog';
import { DUMMY_NOTIFICATIONS } from '../../data/dummyNotifications';
import {
  type Notification,
  type NotificationCounts,
  type NotificationTab,
  NotificationType,
} from '../../types/notificationTypes';
import { NotificationItem } from '../NotificationItem/NotificationItem';

import styles from './NotificationPanel.module.scss';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const TABS: { key: NotificationTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'requires_action', label: 'Requires Action' },
  { key: 'approvals', label: 'Approvals' },
  { key: 'attendance', label: 'Attendance' },
];

function getDateLabel(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const notifDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - notifDate.getTime()) / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function filterNotifications(notifications: Notification[], tab: NotificationTab): Notification[] {
  switch (tab) {
    case 'unread':
      return notifications.filter((n) => !n.isRead);
    case 'requires_action':
      return notifications.filter((n) => n.requiresAction);
    case 'approvals':
      return notifications.filter((n) => n.type === NotificationType.APPROVAL);
    case 'attendance':
      return notifications.filter((n) => n.type === NotificationType.ATTENDANCE);
    default:
      return notifications;
  }
}

function groupByDate(notifications: Notification[]): { label: string; items: Notification[] }[] {
  const groups = new Map<string, Notification[]>();
  for (const n of notifications) {
    const label = getDateLabel(n.timestamp);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(n);
  }
  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }));
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<NotificationTab>('all');
  const [notifications, setNotifications] = useState<Notification[]>(DUMMY_NOTIFICATIONS);

  const counts: NotificationCounts = useMemo(() => {
    const unread = notifications.filter((n) => !n.isRead);
    return {
      all: unread.length,
      unread: unread.length,
      requires_action: unread.filter((n) => !!n.requiresAction).length,
      approvals: unread.filter((n) => n.type === NotificationType.APPROVAL).length,
      attendance: unread.filter((n) => n.type === NotificationType.ATTENDANCE).length,
    };
  }, [notifications]);

  const filtered = useMemo(
    () => filterNotifications(notifications, activeTab),
    [notifications, activeTab],
  );

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  const handleMarkRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkGroupRead = (label: string) => {
    const idsInGroup = grouped.find((g) => g.label === label)?.items.map((n) => n.id) ?? [];
    setNotifications((prev) =>
      prev.map((n) => (idsInGroup.includes(n.id) ? { ...n, isRead: true } : n)),
    );
  };

  const hasUnreadInGroup = (label: string) =>
    grouped.find((g) => g.label === label)?.items.some((n) => !n.isRead) ?? false;

  const tabsAddon = (
    <div className={styles.tabsWrapper}>
      <div className={styles.tabs} role="tablist">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeTab === key}
            className={`${styles.tab} ${activeTab === key ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
            {counts[key] > 0 && (
              <span className={`${styles.badge} ${activeTab === key ? styles.activeBadge : ''}`}>
                {counts[key]}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog
      title="Notifications"
      open={isOpen}
      onClose={onClose}
      position="right"
      maxWidth="620px"
      headerAddon={tabsAddon}
      contentClassName={styles.noContentPadding}
    >
      <div className={styles.listWrapper}>
        {grouped.length === 0 ? (
          <div className={styles.empty}>No notifications</div>
        ) : (
          grouped.map(({ label, items }) => (
            <section key={label}>
              <div className={styles.dateHeader}>
                <div className={styles.dateLabel}>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {label}
                </div>
                {hasUnreadInGroup(label) && (
                  <button className={styles.markReadBtn} onClick={() => handleMarkGroupRead(label)}>
                    <BookCheck size={14} />
                    Mark as read
                  </button>
                )}
              </div>

              {items.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={handleMarkRead}
                />
              ))}
            </section>
          ))
        )}
      </div>
    </Dialog>
  );
};
