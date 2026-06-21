import { AuditLogModule } from '../enums/audit-log-module.enum';
import { AuditAction } from '../enums/audit-action.enum';

export interface AuditLog {
  id: string;
  enterprise_id: string;
  organization_id: string | null;
  actor_id: string;
  actor_name: string;
  actor_email: string;
  actor_role_label: string | null;
  is_platform_admin: boolean;
  module: AuditLogModule;
  sub_module: string | null;
  action: AuditAction;
  entity_type: string;
  entity_id: string;
  entity_display_name: string | null;
  description: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  changed_fields: string[] | null;
  ip_address: string | null;
  user_agent: string | null;
  device: string | null;
  request_id: string | null;
  created_at: string;
}

export interface AuditLogStats {
  total: number;
  by_module: Record<string, number>;
  by_action: Record<string, number>;
}

export interface AuditLogPagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface GetAuditLogsResponse {
  items: AuditLog[];
  pagination: AuditLogPagination;
}

export interface AuditFilterOptions {
  modules: string[];
  actions: string[];
}

export interface GetAuditLogsParams {
  date_from?: string;
  date_to?: string;
  module?: AuditLogModule;
  action?: AuditAction;
  actor_id?: string;
  entity_type?: string;
  entity_id?: string;
  search?: string;
  changed_field?: string;
  sort_by?: 'created_at' | 'actor_name' | 'module';
  sort_order?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}
