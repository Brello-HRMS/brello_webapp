import { Status, SortOrder } from '../../../types/common';

export type ClientStatus = Status;

export interface Client {
  id: string;
  name: string;
  poc_name: string;
  poc_email: string;
  poc_phone: string;
  address: string;
  status: ClientStatus;
  logo_url?: string;
  project_count?: number;
  created_at: string;
  updated_at: string;
}

export interface GetClientByIdResponse {
  success: boolean;
  data: Client;
  timestamp: string;
}

export interface GetClientsResponse {
  success: boolean;
  data: {
    data: Client[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  timestamp: string;
}

export interface GetClientsParams {
  status?: ClientStatus;
  sort_by?: string;
  sort_order?: SortOrder;
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateClientParams {
  name: string;
  poc_name: string;
  poc_email: string;
  poc_phone: string;
  address: string;
  status: ClientStatus;
}

export interface UpdateClientParams {
  name?: string;
  poc_name?: string;
  poc_email?: string;
  poc_phone?: string;
  address?: string;
  status?: ClientStatus;
}
