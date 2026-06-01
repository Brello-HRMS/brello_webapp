import { useQuery } from '@tanstack/react-query';

import { getOrganizations, getOrganization, getOrgStats, getOrgSubscriptions } from './api';

export const ORGS_QUERY_KEY = ['platform', 'organizations'];

export const useOrganizationsList = () =>
  useQuery({
    queryKey: ORGS_QUERY_KEY,
    queryFn: getOrganizations,
  });

export const useOrganization = (id: string) =>
  useQuery({
    queryKey: [...ORGS_QUERY_KEY, id],
    queryFn: () => getOrganization(id),
    enabled: !!id,
  });

export const useOrgStats = (id: string) =>
  useQuery({
    queryKey: [...ORGS_QUERY_KEY, id, 'stats'],
    queryFn: () => getOrgStats(id),
    enabled: !!id,
  });

export const useOrgSubscriptions = (orgId: string) =>
  useQuery({
    queryKey: [...ORGS_QUERY_KEY, orgId, 'subscriptions'],
    queryFn: () => getOrgSubscriptions(orgId),
    enabled: !!orgId,
  });
