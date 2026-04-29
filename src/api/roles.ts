import { apiClient } from '../lib/axios';
import { envVars } from '../utils/envVars';

export const getRoles = async (params?: { search?: string }) => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/roles`, { params });
};

export const createRole = async (data: { name: string; description: string }) => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/roles`, data);
};

export const updateRole = async (id: string, data: { name: string; description: string }) => {
  return apiClient.put(`${envVars.BRELLO_BASE_API}/roles/${id}`, data);
};

export const deleteRole = async (id: string) => {
  return apiClient.delete(`${envVars.BRELLO_BASE_API}/roles/${id}`);
};
