import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type { PlatformRole, CreatePlatformRoleRequest, UpdatePlatformRoleRequest } from './types';

const BASE = `${envVars.BRELLO_BASE_API}/platform-roles`;

export const getPlatformRoles = (): Promise<{ data: PlatformRole[] }> => apiClient.get(BASE);

export const createPlatformRole = (
  data: CreatePlatformRoleRequest,
): Promise<{ data: PlatformRole }> => apiClient.post(BASE, data);

export const updatePlatformRole = (
  id: string,
  data: UpdatePlatformRoleRequest,
): Promise<{ data: PlatformRole }> => apiClient.patch(`${BASE}/${id}`, data);

export const deletePlatformRole = (id: string): Promise<void> => apiClient.delete(`${BASE}/${id}`);
