import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type {
  LetterTemplate,
  LetterTemplateListResponse,
  CreateLetterTemplateParams,
  UpdateLetterTemplateParams,
} from '../types/letterTypes';

const BASE = `${envVars.BRELLO_BASE_API}/platform-admin/letter-templates`;

export const getPlatformLetterTemplates = (categoryId?: string): Promise<LetterTemplateListResponse> =>
  apiClient.get(BASE, { params: categoryId ? { category_id: categoryId } : undefined });

export const getPlatformLetterTemplateById = (id: string): Promise<{ data: LetterTemplate }> =>
  apiClient.get(`${BASE}/${id}`);

export const createPlatformLetterTemplate = (params: CreateLetterTemplateParams): Promise<LetterTemplate> =>
  apiClient.post(BASE, params);

export const updatePlatformLetterTemplate = (
  id: string,
  params: UpdateLetterTemplateParams,
): Promise<LetterTemplate> => apiClient.patch(`${BASE}/${id}`, params);

export const deletePlatformLetterTemplate = (id: string): Promise<void> =>
  apiClient.delete(`${BASE}/${id}`);
