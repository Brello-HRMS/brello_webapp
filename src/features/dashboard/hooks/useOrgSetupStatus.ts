import { useQuery } from '@tanstack/react-query';

import { fetchOrgSetupStatus, type SetupStatusResponse } from '../api/orgSetup';

export const ORG_SETUP_STATUS_QUERY_KEY = ['org-setup-status'];

export const useOrgSetupStatus = ({ enabled = true }: { enabled?: boolean } = {}) => {
  return useQuery<SetupStatusResponse | null, Error>({
    queryKey: ORG_SETUP_STATUS_QUERY_KEY,
    queryFn: fetchOrgSetupStatus,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled,
  });
};
