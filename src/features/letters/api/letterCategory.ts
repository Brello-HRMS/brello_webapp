import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type {
  LetterCategory,
  LetterCategoryListResponse,
  CreateLetterCategoryParams,
  UpdateLetterCategoryParams,
  DocumentType,
} from '../types/letterTypes';

const BASE = `${envVars.BRELLO_BASE_API}/letter-categories`;

export const getLetterCategories = (
  documentType?: DocumentType,
): Promise<LetterCategoryListResponse> =>
  apiClient.get(BASE, { params: documentType ? { document_type: documentType } : undefined });

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
