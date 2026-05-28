import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type {
  PlatformDesignationsResponse,
  CreatePlatformDesignationRequest,
  UpdatePlatformDesignationRequest,
} from './types';

const BASE = `${envVars.BRELLO_BASE_API}/platform-admin/designations`;

export const getPlatformDesignations = (): Promise<PlatformDesignationsResponse> =>
  apiClient.get(BASE);

export const createPlatformDesignation = (
  data: CreatePlatformDesignationRequest,
): Promise<{ success: boolean; data: { id: string; name: string } }> => apiClient.post(BASE, data);

export const updatePlatformDesignation = (
  id: string,
  data: UpdatePlatformDesignationRequest,
): Promise<{ success: boolean; data: { id: string; name: string } }> =>
  apiClient.patch(`${BASE}/${id}`, data);

export const deletePlatformDesignation = (id: string): Promise<void> =>
  apiClient.delete(`${BASE}/${id}`);
