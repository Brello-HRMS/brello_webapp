export {
  FeedbackType,
  FeedbackCategory,
  FeedbackStatus,
  FeedbackPriority,
} from '../enums/feedback.enum';
import {
  FeedbackType,
  FeedbackCategory,
  FeedbackStatus,
  FeedbackPriority,
} from '../enums/feedback.enum';

export interface FeedbackAttachment {
  document_id: string;
  name: string;
  mime_type: string;
}

export interface FeedbackTicket {
  id: string;
  submitted_by: string;
  organization_id: string;
  organization_name?: string | null;
  enterprise_id: string;
  type: FeedbackType;
  category: FeedbackCategory;
  title: string;
  ticket_description: string;
  ticket_status: FeedbackStatus;
  priority: FeedbackPriority;
  affected_module: string | null;
  attachments: FeedbackAttachment[] | null;
  resolved_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FeedbackComment {
  id: string;
  ticket_id: string;
  author_id: string;
  body: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeedbackStatusLog {
  id: string;
  ticket_id: string;
  changed_by: string;
  old_status: FeedbackStatus;
  new_status: FeedbackStatus;
  note: string | null;
  created_at: string;
}

export interface FeedbackTicketDetail extends FeedbackTicket {
  comments: FeedbackComment[];
  status_history?: FeedbackStatusLog[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedFeedbackTickets {
  items: FeedbackTicket[];
  pagination: PaginationMeta;
}

// --- Payloads ---

export interface CreateFeedbackTicketPayload {
  type: FeedbackType;
  category: FeedbackCategory;
  title: string;
  ticket_description: string;
  affected_module?: string;
  attachments?: FeedbackAttachment[];
}

export interface AddCommentPayload {
  body: string;
}

export interface PlatformAddCommentPayload {
  body: string;
  is_internal?: boolean;
}

export interface UpdateTicketPayload {
  status?: FeedbackStatus;
  priority?: FeedbackPriority;
  note?: string;
}

// --- Query params ---

export interface OrgFeedbackQuery {
  type?: FeedbackType;
  category?: FeedbackCategory;
  status?: FeedbackStatus;
  page?: number;
  limit?: number;
}

export interface PlatformFeedbackQuery {
  organization_id?: string;
  enterprise_id?: string;
  type?: FeedbackType;
  category?: FeedbackCategory;
  status?: FeedbackStatus;
  priority?: FeedbackPriority;
  affected_module?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
  limit?: number;
}

export interface PlatformFeedbackStats {
  total: number;
  by_status: Record<string, number>;
  by_type: Record<string, number>;
  by_priority: Record<string, number>;
}
