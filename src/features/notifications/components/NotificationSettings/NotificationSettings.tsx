import React from 'react';

import { usePushSubscription } from '../../../../hooks/usePushSubscription';
import { usePreferences, useUpdatePreference } from '../../hooks/useNotifications';

import styles from './NotificationSettings.module.scss';

import type { NotificationPreference } from '../../api/notificationApi';

type Channel = 'IN_APP' | 'EMAIL' | 'PUSH';

interface EventRow {
  event_type: string;
  label: string;
  channels: Channel[];
}

const SECTIONS: { title: string; events: EventRow[] }[] = [
  {
    title: 'Leave',
    events: [
      { event_type: 'leave.submitted', label: 'Leave submitted', channels: ['IN_APP', 'EMAIL'] },
      { event_type: 'leave.approved', label: 'Leave approved', channels: ['IN_APP', 'EMAIL'] },
      { event_type: 'leave.rejected', label: 'Leave rejected', channels: ['IN_APP', 'EMAIL'] },
      { event_type: 'leave.cancelled', label: 'Leave cancelled', channels: ['IN_APP'] },
    ],
  },
  {
    title: 'Reimbursement',
    events: [
      {
        event_type: 'reimbursement.submitted',
        label: 'Reimbursement submitted',
        channels: ['IN_APP'],
      },
      {
        event_type: 'reimbursement.approved',
        label: 'Reimbursement approved',
        channels: ['IN_APP', 'EMAIL'],
      },
      {
        event_type: 'reimbursement.rejected',
        label: 'Reimbursement rejected',
        channels: ['IN_APP', 'EMAIL'],
      },
    ],
  },
  {
    title: 'Attendance',
    events: [
      { event_type: 'attendance.auto_checkout', label: 'Auto check-out', channels: ['IN_APP'] },
      {
        event_type: 'attendance.correction.approved',
        label: 'Correction approved',
        channels: ['IN_APP'],
      },
      {
        event_type: 'attendance.correction.rejected',
        label: 'Correction rejected',
        channels: ['IN_APP'],
      },
    ],
  },
  {
    title: 'Payroll',
    events: [
      { event_type: 'payroll.reminder', label: 'Payroll reminder', channels: ['IN_APP', 'EMAIL'] },
    ],
  },
];

const ALL_CHANNELS: Channel[] = ['IN_APP', 'EMAIL', 'PUSH'];
const CHANNEL_LABELS: Record<Channel, string> = {
  IN_APP: 'In-App',
  EMAIL: 'Email',
  PUSH: 'Push',
};

function getEnabled(
  preferences: NotificationPreference[],
  eventType: string,
  channel: Channel,
): boolean {
  const pref = preferences.find((p) => p.event_type === eventType && p.channel === channel);
  return pref ? pref.enabled : true; // default: enabled
}

export const NotificationSettings: React.FC = () => {
  const { data: preferences = [], isLoading } = usePreferences();
  const { mutate: updatePref } = useUpdatePreference();
  const {
    permission,
    isSubscribed,
    isLoading: pushLoading,
    subscribe,
    unsubscribe,
  } = usePushSubscription();

  const handleToggle = (event_type: string, channel: Channel, enabled: boolean) => {
    updatePref({ channel, event_type, enabled });
  };

  if (isLoading) {
    return <div className={styles.container}>Loading preferences…</div>;
  }

  return (
    <div className={styles.container}>
      <p className={styles.heading}>Notification Settings</p>
      <p className={styles.subheading}>Control which notifications you receive and how.</p>

      {/* Push permission banner */}
      {permission !== 'unsupported' && (
        <div className={styles.pushBanner}>
          <div className={styles.pushBannerInfo}>
            <strong>Browser Push Notifications</strong>
            <span>
              {permission === 'denied'
                ? 'Blocked in browser settings. Allow notifications for this site to enable.'
                : isSubscribed
                  ? 'Enabled — you will receive push notifications in this browser.'
                  : 'Get notified even when the app is in the background.'}
            </span>
          </div>
          {permission !== 'denied' && (
            <button
              className={`${styles.pushBtn} ${isSubscribed ? styles.pushBtnOff : styles.pushBtnOn}`}
              onClick={isSubscribed ? unsubscribe : subscribe}
              disabled={pushLoading}
            >
              {pushLoading ? '…' : isSubscribed ? 'Disable' : 'Enable'}
            </button>
          )}
        </div>
      )}

      <table className={styles.table}>
        <thead>
          <tr className={styles.headerRow}>
            <th>Event</th>
            {ALL_CHANNELS.map((ch) => (
              <th key={ch}>{CHANNEL_LABELS[ch]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SECTIONS.map((section) => (
            <React.Fragment key={section.title}>
              <tr>
                <td colSpan={4} className={styles.sectionTitle}>
                  {section.title}
                </td>
              </tr>
              {section.events.map((row) => (
                <tr key={row.event_type} className={styles.row}>
                  <td className={styles.eventLabel}>{row.label}</td>
                  {ALL_CHANNELS.map((ch) => {
                    const supported = row.channels.includes(ch);
                    if (!supported) {
                      return (
                        <td key={ch} className={styles.disabledCell}>
                          {ch === 'PUSH' ? 'Soon' : '—'}
                        </td>
                      );
                    }
                    const enabled = getEnabled(preferences, row.event_type, ch);
                    return (
                      <td key={ch}>
                        <label className={styles.toggle}>
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => handleToggle(row.event_type, ch, e.target.checked)}
                          />
                          <span className={styles.slider} />
                        </label>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </React.Fragment>
          ))}

          {/* Auth OTP — always locked on */}
          <tr>
            <td colSpan={4} className={styles.sectionTitle}>
              Security
            </td>
          </tr>
          <tr className={styles.row}>
            <td className={styles.eventLabel}>OTP / verification codes</td>
            {ALL_CHANNELS.map((ch) => (
              <td key={ch}>
                {ch === 'EMAIL' ? (
                  <span className={styles.locked} title="Cannot be disabled">
                    Always on
                  </span>
                ) : (
                  <span className={styles.disabledCell}>—</span>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};
