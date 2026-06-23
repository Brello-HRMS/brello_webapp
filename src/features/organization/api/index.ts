import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type { OrgProfileResponse, OrgStatsResponse, UpdateOrgProfilePayload } from '../types';

const BASE = envVars.BRELLO_BASE_API;

export const getOrgProfile = (organizationId: string): Promise<OrgProfileResponse> =>
  apiClient.get(`${BASE}/organization-profiles/organization/${organizationId}`);

export const updateOrgProfile = (
  profileId: string,
  payload: UpdateOrgProfilePayload,
): Promise<OrgProfileResponse> =>
  apiClient.patch(`${BASE}/organization-profiles/${profileId}`, payload);

export const getOrgStats = (organizationId: string): Promise<OrgStatsResponse> =>
  apiClient.get(`${BASE}/organizations/${organizationId}/stats`);
