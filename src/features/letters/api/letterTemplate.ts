import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type {
  LetterTemplate,
  LetterTemplateListResponse,
  CreateLetterTemplateParams,
  UpdateLetterTemplateParams,
} from '../types/letterTypes';

const BASE = `${envVars.BRELLO_BASE_API}/letter-templates`;

export const getLetterTemplates = (categoryId?: string): Promise<LetterTemplateListResponse> =>
  apiClient.get(BASE, { params: categoryId ? { category_id: categoryId } : undefined });

export const getLetterTemplateById = (id: string): Promise<{ data: LetterTemplate }> =>
  apiClient.get(`${BASE}/${id}`);

export const createLetterTemplate = (params: CreateLetterTemplateParams): Promise<LetterTemplate> =>
  apiClient.post(BASE, params);

export const updateLetterTemplate = (
  id: string,
  params: UpdateLetterTemplateParams,
): Promise<LetterTemplate> => apiClient.patch(`${BASE}/${id}`, params);

export const deleteLetterTemplate = (id: string): Promise<void> =>
  apiClient.delete(`${BASE}/${id}`);
