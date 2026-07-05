import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type { ApiResponse } from '../../../types/common';
import type {
  LetterTemplate,
  CreateLetterTemplateParams,
  UpdateLetterTemplateParams,
  TemplateStatus,
  VariableGroup,
  RenderModel,
} from '../types/letterTypes';

const BASE = `${envVars.BRELLO_BASE_API}/letter-management/templates`;
const VARIABLES_BASE = `${envVars.BRELLO_BASE_API}/letter-management/variables`;

export interface LetterTemplateFilters {
  category_id?: string;
  status?: TemplateStatus;
  search?: string;
}

export const getLetterTemplates = async (
  filters?: LetterTemplateFilters,
): Promise<ApiResponse<LetterTemplate[]>> => apiClient.get(BASE, { params: filters });

export const getLetterTemplate = async (id: string): Promise<ApiResponse<LetterTemplate>> =>
  apiClient.get(`${BASE}/${id}`);

export const createLetterTemplate = async (
  params: CreateLetterTemplateParams,
): Promise<ApiResponse<LetterTemplate>> => apiClient.post(BASE, params);

export const updateLetterTemplate = async (
  id: string,
  params: UpdateLetterTemplateParams,
): Promise<ApiResponse<LetterTemplate>> => apiClient.patch(`${BASE}/${id}`, params);

export const publishLetterTemplate = async (id: string): Promise<ApiResponse<LetterTemplate>> =>
  apiClient.post(`${BASE}/${id}/publish`);

export const duplicateLetterTemplate = async (id: string): Promise<ApiResponse<LetterTemplate>> =>
  apiClient.post(`${BASE}/${id}/duplicate`);

export const previewLetterTemplate = async (id: string): Promise<ApiResponse<RenderModel>> =>
  apiClient.post(`${BASE}/${id}/preview`);

export const archiveLetterTemplate = async (id: string): Promise<ApiResponse<LetterTemplate>> =>
  apiClient.delete(`${BASE}/${id}`);

export const getVariableRegistry = async (): Promise<ApiResponse<VariableGroup[]>> =>
  apiClient.get(VARIABLES_BASE);
