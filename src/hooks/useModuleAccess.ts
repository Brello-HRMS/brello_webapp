import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { checkModuleAccess } from '../api/moduleAccess';
import { ModuleCode, ActionCode } from '../enum/modules';
import { capitalize } from '../utils/stringUtils';

export type AccessMap = {
  [K in ActionCode as `has${Capitalize<K>}Access`]: boolean;
};

export type ModuleAccessResult = AccessMap & { isLoading: boolean };

// Single shared cache key — all module checks share one API call
export const PERMISSIONS_QUERY_KEY = ['permissions'] as const;

export const useModuleAccess = (moduleCode: ModuleCode): ModuleAccessResult => {
  const { data, isPending } = useQuery({
    queryKey: PERMISSIONS_QUERY_KEY,
    queryFn: checkModuleAccess,
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
  });

  return useMemo(() => {
    const accessMap = Object.values(ActionCode).reduce((acc, code) => {
      acc[`has${capitalize(code)}Access` as keyof AccessMap] = false;
      return acc;
    }, {} as AccessMap);

    if (!data?.data) return { ...accessMap, isLoading: isPending };

    for (const item of data.data) {
      if (item.module_code === moduleCode && item.action_code) {
        const key = `has${capitalize(item.action_code)}Access` as keyof AccessMap;
        if (key in accessMap) {
          accessMap[key] = true;
        }
      }
    }

    return { ...accessMap, isLoading: isPending };
  }, [moduleCode, data, isPending]);
};
