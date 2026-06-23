import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type {
  GetAuditLogsParams,
  GetAuditLogsResponse,
  AuditLogStats,
  AuditLog,
  AuditFilterOptions,
} from '../types/audit.types';

const BASE = `${envVars.BRELLO_BASE_API}/audit-logs`;
const PLATFORM_BASE = `${envVars.BRELLO_BASE_API}/platform/audit-logs`;

// The response interceptor in apiClient returns response.data, which is the
// TransformInterceptor wrapper { success, data, timestamp }. We use the second
// Axios generic (R) to tell TypeScript what the resolved shape actually is, then
// unwrap to the inner payload.
type Wrapped<T> = { data: T };

export const getAuditLogs = (params?: GetAuditLogsParams): Promise<GetAuditLogsResponse> =>
  apiClient
    .get<GetAuditLogsResponse, Wrapped<GetAuditLogsResponse>>(BASE, { params })
    .then((r) => r.data);

export const getAuditLogStats = (dateFrom?: string, dateTo?: string): Promise<AuditLogStats> =>
  apiClient
    .get<AuditLogStats, Wrapped<AuditLogStats>>(`${BASE}/stats`, {
      params: { date_from: dateFrom, date_to: dateTo },
    })
    .then((r) => r.data);

export const getEntityHistory = (entityType: string, entityId: string): Promise<AuditLog[]> =>
  apiClient
    .get<AuditLog[], Wrapped<AuditLog[]>>(`${BASE}/entity/${entityType}/${entityId}`)
    .then((r) => r.data);

export const getPlatformAuditLogs = (
  params?: GetAuditLogsParams & { organization_id?: string },
): Promise<GetAuditLogsResponse> =>
  apiClient
    .get<GetAuditLogsResponse, Wrapped<GetAuditLogsResponse>>(PLATFORM_BASE, { params })
    .then((r) => r.data);

export const getAuditFilterOptions = (): Promise<AuditFilterOptions> =>
  apiClient
    .get<AuditFilterOptions, Wrapped<AuditFilterOptions>>(`${BASE}/filter-options`)
    .then((r) => r.data);

export const getPlatformAuditFilterOptions = (
  organizationId?: string,
): Promise<AuditFilterOptions> =>
  apiClient
    .get<AuditFilterOptions, Wrapped<AuditFilterOptions>>(`${PLATFORM_BASE}/filter-options`, {
      params: organizationId ? { organization_id: organizationId } : undefined,
    })
    .then((r) => r.data);

export const getPlatformAuditLogStats = (
  organizationId?: string,
  dateFrom?: string,
  dateTo?: string,
): Promise<AuditLogStats> =>
  apiClient
    .get<AuditLogStats, Wrapped<AuditLogStats>>(`${PLATFORM_BASE}/stats`, {
      params: { organization_id: organizationId, date_from: dateFrom, date_to: dateTo },
    })
    .then((r) => r.data);
