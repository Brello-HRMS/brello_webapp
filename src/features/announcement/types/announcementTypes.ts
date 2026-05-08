export enum AnnouncementStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum AnnouncementPriority {
  NORMAL = 'NORMAL',
  IMPORTANT = 'IMPORTANT',
  URGENT = 'URGENT',
}

export enum AnnouncementPublishType {
  INSTANT = 'INSTANT',
  SCHEDULED = 'SCHEDULED',
}

export enum AnnouncementAudienceType {
  ALL = 'ALL',
  DEPARTMENTS = 'DEPARTMENTS',
  LOCATIONS = 'LOCATIONS',
  EMPLOYEES = 'EMPLOYEES',
}

export interface AnnouncementAudience {
  type: AnnouncementAudienceType;
  department_ids?: string[];
  location_ids?: string[];
  employee_ids?: string[];
}

export interface AnnouncementAnalytics {
  total_recipients: number;
  read_count: number;
  unread_count: number;
}

export interface AnnouncementAttachment {
  id?: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  mime_type?: string;
}

export interface Announcement {
  id: string;
  title: string;
  description_html: string;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  publish_type: AnnouncementPublishType;
  scheduled_at: string | null;
  published_at: string | null;
  archived_at: string | null;
  send_push: boolean;
  send_email: boolean;
  audience: AnnouncementAudience;
  attachments: AnnouncementAttachment[];
  analytics?: AnnouncementAnalytics;
  created_by_name?: string;
  read_count?: number;
  created_at: string;
  updated_at: string;
}

export interface EmployeeAnnouncement {
  id: string;
  title: string;
  description_html: string;
  priority: AnnouncementPriority;
  published_at: string | null;
  is_read: boolean;
  attachments: AnnouncementAttachment[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedAnnouncements {
  items: Announcement[];
  pagination: PaginationMeta;
}

export interface PaginatedEmployeeAnnouncements {
  items: EmployeeAnnouncement[];
  pagination: PaginationMeta;
}

export interface CreateAnnouncementPayload {
  title: string;
  description_html: string;
  priority: AnnouncementPriority;
  publish_type: AnnouncementPublishType;
  scheduled_at?: string;
  audience: AnnouncementAudience;
  send_push: boolean;
  send_email: boolean;
  attachments?: AnnouncementAttachment[];
}

export interface AdminAnnouncementQuery {
  status?: AnnouncementStatus;
  priority?: AnnouncementPriority;
  search?: string;
  page?: number;
  limit?: number;
}

export interface EmployeeAnnouncementQuery {
  page?: number;
  limit?: number;
}

export interface AnnouncementFormData {
  title: string;
  description_html: string;
  priority: AnnouncementPriority;
  publish_type: AnnouncementPublishType;
  scheduled_at: string;
  audience_type: AnnouncementAudienceType;
  department_ids: string[];
  location_ids: string[];
  employee_ids: string[];
  send_push: boolean;
  send_email: boolean;
}
