import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';
import { NotificationType } from '../types/notificationTypes';

import type { Notification, NotificationIconVariant } from '../types/notificationTypes';

const BASE = envVars.BRELLO_BASE_API;

interface RawNotification {
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

function mapNotification(raw: RawNotification): Notification {
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
