import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type {
  Client,
  GetClientsParams,
  GetClientsResponse,
  UpdateClientParams,
  CreateClientParams,
} from '../types/clientType';

export const getClients = async (params?: GetClientsParams): Promise<GetClientsResponse> => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/clients`, { params });
};

export const deleteClient = async (id: string): Promise<void> => {
  return apiClient.delete(`${envVars.BRELLO_BASE_API}/clients/${id}`);
};

export const updateClient = async (id: string, params: UpdateClientParams): Promise<Client> => {
  return apiClient.patch(`${envVars.BRELLO_BASE_API}/clients/${id}`, params);
};

export const getClientById = async (id: string): Promise<Client> => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/clients/${id}`);
};

export const createClient = async (params: CreateClientParams): Promise<Client> => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/clients`, params);
};
