import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type {
  GetGroupedPoliciesResponse,
  GetPolicyByIdResponse,
  CreatePolicyParams,
  UpdatePolicyParams,
  Policy,
} from '../types/policyType';

const BASE = `${envVars.BRELLO_BASE_API}/policies`;

export const getGroupedPolicies = async (): Promise<GetGroupedPoliciesResponse> => {
  return apiClient.get(`${BASE}/grouped`);
};

export const getPolicyById = async (id: string): Promise<GetPolicyByIdResponse> => {
  return apiClient.get(`${BASE}/${id}`);
};

export const createPolicy = async (params: CreatePolicyParams): Promise<Policy> => {
  return apiClient.post(BASE, params);
};

export const updatePolicy = async (id: string, params: UpdatePolicyParams): Promise<Policy> => {
  return apiClient.patch(`${BASE}/${id}`, params);
};

export const deletePolicy = async (id: string): Promise<void> => {
  return apiClient.delete(`${BASE}/${id}`);
};
