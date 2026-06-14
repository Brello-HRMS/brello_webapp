export enum NotificationType {
  LEAVE = 'leave',
  EMPLOYEE = 'employee',
  DOCUMENT = 'document',
  PAYROLL = 'payroll',
  APPROVAL = 'approval',
  ATTENDANCE = 'attendance',
}

export type NotificationTab = 'all' | 'unread' | 'requires_action' | 'approvals' | 'attendance';

export type NotificationIconVariant = 'success' | 'warning' | 'error' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO date string
  isRead: boolean;
  avatar?: string; // employee photo URL
  iconVariant?: NotificationIconVariant;
  requiresAction?: boolean;
}

export interface NotificationGroup {
  label: string;
  notifications: Notification[];
}

export interface NotificationCounts {
  all: number;
  unread: number;
  requires_action: number;
  approvals: number;
  attendance: number;
}
