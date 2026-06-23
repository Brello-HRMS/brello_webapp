import { useQuery } from '@tanstack/react-query';

import { getAuditLogs, getPlatformAuditLogs } from '../api/audit.api';
import { showToast } from '../../ToastFeature/ShowToast';

import type { ApiError } from '../../../types/common';
import type { GetAuditLogsParams } from '../types/audit.types';

export const useAuditLogs = (params?: GetAuditLogsParams) => {
  const query = useQuery({
    queryKey: ['audit-logs', params],
    queryFn: async () => {
      try {
        return await getAuditLogs(params);
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to fetch audit logs';
        showToast(message, 'error');
        throw error;
      }
    },
    placeholderData: (previousData) => previousData,
  });

  return {
    items: query.data?.items ?? [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const usePlatformAuditLogs = (
  params?: GetAuditLogsParams & { organization_id?: string },
) => {
  const query = useQuery({
    queryKey: ['platform-audit-logs', params],
    queryFn: async () => {
      try {
        return await getPlatformAuditLogs(params);
      } catch (error) {
        const message = (error as ApiError)?.data?.message || 'Failed to fetch audit logs';
        showToast(message, 'error');
        throw error;
      }
    },
    placeholderData: (previousData) => previousData,
  });

  return {
    items: query.data?.items ?? [],
    pagination: query.data?.pagination,
    isLoading: query.isLoading,
    error: query.error,
  };
};
