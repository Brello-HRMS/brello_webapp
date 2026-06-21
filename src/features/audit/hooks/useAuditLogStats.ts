import { useQuery } from '@tanstack/react-query';

import {
  getAuditLogStats,
  getPlatformAuditLogStats,
  getAuditFilterOptions,
  getPlatformAuditFilterOptions,
} from '../api/audit.api';

import type { ApiError } from '../../../types/common';

export const useAuditLogStats = (dateFrom?: string, dateTo?: string) => {
  return useQuery({
    queryKey: ['audit-log-stats', dateFrom, dateTo],
    queryFn: async () => {
      try {
        return await getAuditLogStats(dateFrom, dateTo);
      } catch (error) {
        throw error as ApiError;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useAuditFilterOptions = () =>
  useQuery({
    queryKey: ['audit-filter-options'],
    queryFn: getAuditFilterOptions,
    staleTime: 10 * 60 * 1000,
  });

export const usePlatformAuditFilterOptions = (organizationId?: string) =>
  useQuery({
    queryKey: ['platform-audit-filter-options', organizationId],
    queryFn: () => getPlatformAuditFilterOptions(organizationId),
    staleTime: 10 * 60 * 1000,
  });

export const usePlatformAuditLogStats = (
  organizationId?: string,
  dateFrom?: string,
  dateTo?: string,
) => {
  return useQuery({
    queryKey: ['platform-audit-log-stats', organizationId, dateFrom, dateTo],
    queryFn: async () => {
      try {
        return await getPlatformAuditLogStats(organizationId, dateFrom, dateTo);
      } catch (error) {
        throw error as ApiError;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};
