import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';
import { isAdminApp } from '../../../utils/authUtils';
import { NotificationType } from '../types/notificationTypes';

import type { Notification, NotificationIconVariant } from '../types/notificationTypes';

const BASE = envVars.BRELLO_BASE_API;

export interface RawNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'IN_APP' | 'EMAIL' | 'PUSH';
  is_read: boolean;
  read_at: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

const EVENT_TYPE_MAP: Record<string, NotificationType> = {
  'leave.approved': NotificationType.APPROVAL,
  'leave.rejected': NotificationType.APPROVAL,
  'leave.submitted': NotificationType.APPROVAL,
  'reimbursement.approved': NotificationType.APPROVAL,
  'reimbursement.rejected': NotificationType.APPROVAL,
  'attendance.auto_checkout': NotificationType.ATTENDANCE,
  'attendance.correction.approved': NotificationType.ATTENDANCE,
  'attendance.correction.rejected': NotificationType.ATTENDANCE,
  'payroll.reminder': NotificationType.PAYROLL,
  'employee.invited': NotificationType.EMPLOYEE,
  'employee.activated': NotificationType.EMPLOYEE,
};

const ICON_VARIANT_MAP: Record<string, NotificationIconVariant> = {
  'leave.approved': 'success',
  'leave.rejected': 'error',
  'reimbursement.approved': 'success',
  'reimbursement.rejected': 'error',
  'reimbursement.paid': 'success',
  'attendance.auto_checkout': 'warning',
  'payroll.reminder': 'warning',
};

// Where a notification takes you when clicked, keyed by event category (the part
// before the first dot in event_type). Targets differ per active app; unmapped
// categories get no link (click just marks read, as before) so we never 404.
const ADMIN_LINKS: Record<string, string> = {
  reimbursement: '/reimbursement/list',
  attendance: '/attendance/daily',
  payroll: '/payroll/listing',
  employee: '/employee/directory',
};
const EMPLOYEE_LINKS: Record<string, string> = {
  leave: '/leave/me',
  reimbursement: '/reimbursement/me',
};

function resolveLink(eventType: string): string | undefined {
  const category = eventType.split('.')[0];
  if (!category) return undefined;
  return (isAdminApp() ? ADMIN_LINKS : EMPLOYEE_LINKS)[category];
}

export function mapNotification(raw: RawNotification): Notification {
  const eventType = (raw.metadata?.event_type as string) ?? '';
  return {
    id: raw.id,
    title: raw.title,
    message: raw.message,
    timestamp: raw.created_at,
    isRead: raw.is_read,
    type: EVENT_TYPE_MAP[eventType] ?? NotificationType.EMPLOYEE,
    iconVariant: ICON_VARIANT_MAP[eventType],
    requiresAction: (raw.metadata?.requires_action as boolean) ?? false,
    link: resolveLink(eventType),
  };
}

export async function getAllNotifications(): Promise<Notification[]> {
  const res: { data: RawNotification[] } = await apiClient.get(`${BASE}/notifications`);
  return res.data.map(mapNotification);
}

export async function getUnreadCount(): Promise<number> {
  const res: { data: { count: number } } = await apiClient.get(
    `${BASE}/notifications/unread-count`,
  );
  return res.data.count;
}

export async function markAsRead(id: string): Promise<void> {
  await apiClient.patch(`${BASE}/notifications/${id}/read`);
}

export async function markAllAsRead(): Promise<void> {
  await apiClient.patch(`${BASE}/notifications/read-all`);
}

// --- Preferences ---

export interface NotificationPreference {
  id: string;
  user_id: string;
  channel: 'IN_APP' | 'EMAIL' | 'PUSH';
  event_type: string;
  enabled: boolean;
}

export async function getPreferences(): Promise<NotificationPreference[]> {
  const res: { data: NotificationPreference[] } = await apiClient.get(
    `${BASE}/notifications/preferences`,
  );
  return res.data;
}

export async function updatePreference(
  channel: 'IN_APP' | 'EMAIL' | 'PUSH',
  event_type: string,
  enabled: boolean,
): Promise<NotificationPreference> {
  const res: { data: NotificationPreference } = await apiClient.patch(
    `${BASE}/notifications/preferences`,
    { channel, event_type, enabled },
  );
  return res.data;
}

// --- Web Push ---

export async function getVapidPublicKey(): Promise<string | null> {
  const res: { data: { publicKey: string | null } } = await apiClient.get(
    `${BASE}/notifications/vapid-public-key`,
  );
  return res.data.publicKey;
}

export async function registerPushSubscription(subscription: PushSubscriptionJSON): Promise<void> {
  const keys = subscription.keys as { p256dh: string; auth: string } | undefined;
  if (!subscription.endpoint || !keys?.p256dh || !keys?.auth) {
    throw new Error('Invalid push subscription object');
  }
  await apiClient.post(`${BASE}/notifications/push-subscription`, {
    endpoint: subscription.endpoint,
    p256dh: keys.p256dh,
    auth: keys.auth,
    platform: 'web',
  });
}

export async function unregisterPushSubscription(endpoint: string): Promise<void> {
  await apiClient.delete(`${BASE}/notifications/push-subscription`, {
    data: { endpoint },
  });
}
