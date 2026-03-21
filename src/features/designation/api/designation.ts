import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type {
  Designation,
  GetDesignationsParams,
  GetDesignationsResponse,
  UpdateDesignationParams,
  CreateDesignationParams,
} from '../types/designationType';

export const getDesignations = async (
  params?: GetDesignationsParams,
): Promise<GetDesignationsResponse> => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/designations`, { params });
};

export const deleteDesignation = async (id: string): Promise<void> => {
  return apiClient.delete(`${envVars.BRELLO_BASE_API}/designations/${id}`);
};

export const updateDesignation = async (
  id: string,
  params: UpdateDesignationParams,
): Promise<Designation> => {
  return apiClient.patch(`${envVars.BRELLO_BASE_API}/designations/${id}`, params);
};

export const getDesignationById = async (id: string): Promise<Designation> => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/designations/${id}`);
};

export const createDesignation = async (params: CreateDesignationParams): Promise<Designation> => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/designations`, params);
};
