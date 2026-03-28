import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { checkModuleAccess } from '../api/moduleAccess';
import { ModuleCode, ActionCode } from '../enum/modules';
import { capitalize } from '../utils/stringUtils';

// Fully typing the AccessMap restores autocomplete down the line!
export type AccessMap = {
  [K in ActionCode as `has${Capitalize<K>}Access`]: boolean;
};

export const useModuleAccess = (moduleCode: ModuleCode): AccessMap => {
  const { data } = useQuery({
    queryKey: ['module-access', moduleCode],
    queryFn: () => checkModuleAccess(),
    placeholderData: (previousData) => previousData,
  });

  return useMemo(() => {
    const accessMap = Object.values(ActionCode).reduce((acc, code) => {
      acc[`has${capitalize(code)}Access` as keyof AccessMap] = false;
      return acc;
    }, {} as AccessMap);

    if (!data?.data) return accessMap;

    for (const item of data.data) {
      if (item.module_code === moduleCode && item.action_code) {
        const key = `has${capitalize(item.action_code)}Access` as keyof AccessMap;

        if (key in accessMap) {
          accessMap[key] = true;
        }
      }
    }

    return accessMap;
  }, [data?.data, moduleCode, data]);
};
