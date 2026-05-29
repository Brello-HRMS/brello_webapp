import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type { OrganizationsResponse, Organization, OrgSubscription, OrgStats } from './types';

const BASE = `${envVars.BRELLO_BASE_API}/organizations`;
const SUB_BASE = `${envVars.BRELLO_BASE_API}/organization-subscriptions`;

export const getOrganizations = (): Promise<OrganizationsResponse> => apiClient.get(BASE);

export const getOrganization = (id: string): Promise<{ data: Organization }> =>
  apiClient.get(`${BASE}/${id}`);

export const getOrgStats = (id: string): Promise<OrgStats> => apiClient.get(`${BASE}/${id}/stats`);

export const getOrgSubscriptions = (orgId: string): Promise<OrgSubscription[]> =>
  apiClient.get(`${SUB_BASE}/organization/${orgId}`);
