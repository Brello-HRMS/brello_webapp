import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type { ApiResponse } from '../../../types/common';
import type {
  OfferTemplate,
  CreateOfferTemplateParams,
  UpdateOfferTemplateParams,
  OfferTemplateFilters,
} from '../types/offerTypes';

const BASE = `${envVars.BRELLO_BASE_API}/offer-management/templates`;

export const getOfferTemplates = (
  filters?: OfferTemplateFilters,
): Promise<ApiResponse<OfferTemplate[]>> => apiClient.get(BASE, { params: filters });

export const getOfferTemplate = (id: string): Promise<ApiResponse<OfferTemplate>> =>
  apiClient.get(`${BASE}/${id}`);

export const createOfferTemplate = (
  params: CreateOfferTemplateParams,
): Promise<ApiResponse<OfferTemplate>> => apiClient.post(BASE, params);

export const updateOfferTemplate = (
  id: string,
  params: UpdateOfferTemplateParams,
): Promise<ApiResponse<OfferTemplate>> => apiClient.patch(`${BASE}/${id}`, params);

export const publishOfferTemplate = (id: string): Promise<ApiResponse<OfferTemplate>> =>
  apiClient.post(`${BASE}/${id}/publish`);

export const duplicateOfferTemplate = (id: string): Promise<ApiResponse<OfferTemplate>> =>
  apiClient.post(`${BASE}/${id}/duplicate`);

export const archiveOfferTemplate = (id: string): Promise<ApiResponse<OfferTemplate>> =>
  apiClient.delete(`${BASE}/${id}`);
