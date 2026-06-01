import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type {
  IndustryTypesResponse,
  IndustryTypeResponse,
  CreateIndustryTypeRequest,
  UpdateIndustryTypeRequest,
} from './types';

const BASE = `${envVars.BRELLO_BASE_API}/industry-types`;

export const getIndustryTypes = (): Promise<IndustryTypesResponse> => apiClient.get(BASE);

export const createIndustryType = (
  data: CreateIndustryTypeRequest,
): Promise<IndustryTypeResponse> => apiClient.post(BASE, data);

export const updateIndustryType = (
  id: string,
  data: UpdateIndustryTypeRequest,
): Promise<IndustryTypeResponse> => apiClient.patch(`${BASE}/${id}`, data);

export const deleteIndustryType = (id: string): Promise<void> => apiClient.delete(`${BASE}/${id}`);
