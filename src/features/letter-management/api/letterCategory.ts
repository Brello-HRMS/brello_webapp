import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type { ApiResponse } from '../../../types/common';
import type {
  LetterCategory,
  CreateLetterCategoryParams,
  UpdateLetterCategoryParams,
} from '../types/letterTypes';

const BASE = `${envVars.BRELLO_BASE_API}/letter-management/categories`;

export const getLetterCategories = async (
  search?: string,
): Promise<ApiResponse<LetterCategory[]>> => apiClient.get(BASE, { params: { search } });

export const createLetterCategory = async (
  params: CreateLetterCategoryParams,
): Promise<ApiResponse<LetterCategory>> => apiClient.post(BASE, params);

export const updateLetterCategory = async (
  id: string,
  params: UpdateLetterCategoryParams,
): Promise<ApiResponse<LetterCategory>> => apiClient.patch(`${BASE}/${id}`, params);

export const archiveLetterCategory = async (id: string): Promise<ApiResponse<LetterCategory>> =>
  apiClient.delete(`${BASE}/${id}`);

export const unarchiveLetterCategory = async (id: string): Promise<ApiResponse<LetterCategory>> =>
  apiClient.post(`${BASE}/${id}/unarchive`);
