import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { showToast } from '../../ToastFeature/ShowToast';
import { getOrgProfile, getOrgStats, updateOrgProfile } from '../api';

import type { UpdateOrgProfilePayload } from '../types';

export const ORG_PROFILE_KEY = (orgId: string) => ['org', 'profile', orgId];
export const ORG_STATS_KEY = (orgId: string) => ['org', 'stats', orgId];

export const useOrgProfile = (organizationId: string | undefined) => {
  return useQuery({
    queryKey: ORG_PROFILE_KEY(organizationId ?? ''),
    queryFn: () => getOrgProfile(organizationId!),
    enabled: !!organizationId,
    select: (res) => res.data,
  });
};

export const useOrgStats = (organizationId: string | undefined) => {
  return useQuery({
    queryKey: ORG_STATS_KEY(organizationId ?? ''),
    queryFn: () => getOrgStats(organizationId!),
    enabled: !!organizationId,
    select: (res) => res.data,
  });
};

export const useUpdateOrgProfile = (organizationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ profileId, payload }: { profileId: string; payload: UpdateOrgProfilePayload }) =>
      updateOrgProfile(profileId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORG_PROFILE_KEY(organizationId) });
      showToast('Profile updated successfully', 'success');
    },
    onError: () => {
      showToast('Failed to update profile', 'error');
    },
  });
};
