import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type { ApiResponse } from '../../../types/common';
import type { HierarchyNode, MyHierarchy } from '../types/hierarchyType';

const BASE = `${envVars.BRELLO_BASE_API}/hierarchy`;

/** Full company-wide org tree (Admin). */
export const getOrgTree = (): Promise<ApiResponse<HierarchyNode[]>> =>
  apiClient.get(`${BASE}/tree`);

/** The logged-in user's own hierarchy: manager chain + reportee subtree. */
export const getMyHierarchy = (): Promise<ApiResponse<MyHierarchy>> => apiClient.get(`${BASE}/me`);

/** Reportees of a user — direct by default, full subtree when recursive. */
export const getReportees = (
  userId: string,
  recursive = false,
): Promise<ApiResponse<HierarchyNode[]>> =>
  apiClient.get(`${BASE}/reportees/${userId}`, {
    params: recursive ? { recursive: 'true' } : {},
  });

/** Manager chain above a user (direct manager first → top last). */
export const getManagers = (userId: string): Promise<ApiResponse<HierarchyNode[]>> =>
  apiClient.get(`${BASE}/managers/${userId}`);
