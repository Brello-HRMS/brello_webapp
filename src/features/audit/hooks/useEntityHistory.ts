import { useQuery } from '@tanstack/react-query';

import { getEntityHistory } from '../api/audit.api';

import type { ApiError } from '../../../types/common';

export const useEntityHistory = (entityType?: string, entityId?: string) => {
  return useQuery({
    queryKey: ['audit-entity-history', entityType, entityId],
    queryFn: async () => {
      try {
        return await getEntityHistory(entityType!, entityId!);
      } catch (error) {
        throw error as ApiError;
      }
    },
    enabled: !!entityType && !!entityId,
  });
};
