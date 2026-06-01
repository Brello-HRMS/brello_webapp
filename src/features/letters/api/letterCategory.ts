import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type {
  LetterCategory,
  LetterCategoryListResponse,
  CreateLetterCategoryParams,
  UpdateLetterCategoryParams,
} from '../types/letterTypes';

const BASE = `${envVars.BRELLO_BASE_API}/letter-categories`;

export const getLetterCategories = (): Promise<LetterCategoryListResponse> => apiClient.get(BASE);

export const getLetterCategoryById = (id: string): Promise<{ data: LetterCategory }> =>
  apiClient.get(`${BASE}/${id}`);

export const createLetterCategory = (params: CreateLetterCategoryParams): Promise<LetterCategory> =>
  apiClient.post(BASE, params);

export const updateLetterCategory = (
  id: string,
  params: UpdateLetterCategoryParams,
): Promise<LetterCategory> => apiClient.patch(`${BASE}/${id}`, params);

export const deleteLetterCategory = (id: string): Promise<void> =>
  apiClient.delete(`${BASE}/${id}`);
