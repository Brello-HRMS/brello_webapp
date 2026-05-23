import { useQuery } from '@tanstack/react-query';

import { fetchOrgSetupStatus, type SetupStatusResponse } from '../api/orgSetup';

export const ORG_SETUP_STATUS_QUERY_KEY = ['org-setup-status'];

export const useOrgSetupStatus = () => {
  return useQuery<SetupStatusResponse | null, Error>({
    queryKey: ORG_SETUP_STATUS_QUERY_KEY,
    queryFn: fetchOrgSetupStatus,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};
