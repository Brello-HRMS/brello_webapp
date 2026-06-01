import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type {
  EnterprisesResponse,
  EnterpriseResponse,
  CreateEnterpriseRequest,
  UpdateEnterpriseRequest,
} from './types';

const BASE = `${envVars.BRELLO_BASE_API}/enterprises`;

export const getEnterprises = (): Promise<EnterprisesResponse> => apiClient.get(BASE);

export const getEnterprise = (id: string): Promise<EnterpriseResponse> =>
  apiClient.get(`${BASE}/${id}`);

export const createEnterprise = (data: CreateEnterpriseRequest): Promise<EnterpriseResponse> =>
  apiClient.post(BASE, data);

export const updateEnterprise = (
  id: string,
  data: UpdateEnterpriseRequest,
): Promise<EnterpriseResponse> => apiClient.patch(`${BASE}/${id}`, data);

export const deleteEnterprise = (id: string): Promise<void> => apiClient.delete(`${BASE}/${id}`);
