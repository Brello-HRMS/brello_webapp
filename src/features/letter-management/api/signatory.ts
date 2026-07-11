import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type { ApiResponse } from '../../../types/common';
import type { Signatory } from '../types/letterTypes';

const BASE = `${envVars.BRELLO_BASE_API}/letter-management/signatories`;

export const getSignatories = async (search?: string): Promise<ApiResponse<Signatory[]>> =>
  apiClient.get(BASE, { params: { search } });

export interface CreateSignatoryParams {
  name: string;
  designation: string;
  is_default?: boolean;
  file: File;
}

export const createSignatory = async (
  params: CreateSignatoryParams,
): Promise<ApiResponse<Signatory>> => {
  const formData = new FormData();
  formData.append('name', params.name);
  formData.append('designation', params.designation);
  if (params.is_default !== undefined) formData.append('is_default', String(params.is_default));
  formData.append('file', params.file);
  return apiClient.post(BASE, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export interface UpdateSignatoryParams {
  name?: string;
  designation?: string;
  is_default?: boolean;
}

export const updateSignatory = async (
  id: string,
  params: UpdateSignatoryParams,
): Promise<ApiResponse<Signatory>> => apiClient.patch(`${BASE}/${id}`, params);

export const setDefaultSignatory = async (id: string): Promise<ApiResponse<Signatory>> =>
  apiClient.post(`${BASE}/${id}/set-default`);

export const archiveSignatory = async (id: string): Promise<ApiResponse<Signatory>> =>
  apiClient.delete(`${BASE}/${id}`);

export const unarchiveSignatory = async (id: string): Promise<ApiResponse<Signatory>> =>
  apiClient.post(`${BASE}/${id}/unarchive`);
