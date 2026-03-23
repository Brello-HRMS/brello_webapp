import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type {
  GetPolicyTypesResponse,
  CreatePolicyTypeParams,
  UpdatePolicyTypeParams,
  PolicyType,
} from '../types/policyType';

const BASE = `${envVars.BRELLO_BASE_API}/policy-types`;

export const getPolicyTypes = async (): Promise<GetPolicyTypesResponse> => {
  return apiClient.get(BASE);
};

export const createPolicyType = async (params: CreatePolicyTypeParams): Promise<PolicyType> => {
  return apiClient.post(BASE, params);
};

export const updatePolicyType = async (
  id: string,
  params: UpdatePolicyTypeParams,
): Promise<PolicyType> => {
  return apiClient.patch(`${BASE}/${id}`, params);
};

export const deletePolicyType = async (id: string): Promise<void> => {
  return apiClient.delete(`${BASE}/${id}`);
};
