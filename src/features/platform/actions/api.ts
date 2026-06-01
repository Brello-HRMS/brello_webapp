import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type { ActionsResponse, CreateActionRequest, UpdateActionRequest } from './types';

const BASE = `${envVars.BRELLO_BASE_API}/actions`;

export const getActions = (): Promise<ActionsResponse> => apiClient.get(BASE);

export const createAction = (
  data: CreateActionRequest,
): Promise<{ success: boolean; data: { id: string; name: string } }> => apiClient.post(BASE, data);

export const updateAction = (
  id: string,
  data: UpdateActionRequest,
): Promise<{ success: boolean; data: { id: string; name: string } }> =>
  apiClient.patch(`${BASE}/${id}`, data);

export const deleteAction = (id: string): Promise<void> => apiClient.delete(`${BASE}/${id}`);
