import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type { ApiResponse } from '../../../types/common';
import type {
  IssuedLetter,
  IssuedLetterFilters,
  GenerateLetterParams,
  ResolveLetterResponse,
  GenerateLetterResponse,
  EmployeeSearchResult,
} from '../types/letterTypes';

const BASE = `${envVars.BRELLO_BASE_API}/letter-management`;

export const searchEmployees = async (): Promise<ApiResponse<EmployeeSearchResult[]>> =>
  apiClient.get(`${BASE}/employees/search`);

export const resolveIssuedLetter = async (params: {
  employee_id: string;
  template_id: string;
}): Promise<ApiResponse<ResolveLetterResponse>> =>
  apiClient.post(`${BASE}/issued-letters/resolve`, params);

export const getIssuedLetters = async (
  filters?: IssuedLetterFilters,
): Promise<ApiResponse<IssuedLetter[]>> =>
  apiClient.get(`${BASE}/issued-letters`, { params: filters });

export const generateIssuedLetter = async (
  params: GenerateLetterParams,
  idempotencyKey: string,
): Promise<ApiResponse<GenerateLetterResponse>> =>
  apiClient.post(`${BASE}/issued-letters`, params, {
    headers: { 'Idempotency-Key': idempotencyKey },
  });

export const getIssuedLetterDownloadUrl = async (
  id: string,
): Promise<ApiResponse<{ url: string }>> => apiClient.get(`${BASE}/issued-letters/${id}/download`);

export const getMyLetters = async (): Promise<ApiResponse<IssuedLetter[]>> =>
  apiClient.get(`${BASE}/me`);

export const getMyLetterDownloadUrl = async (id: string): Promise<ApiResponse<{ url: string }>> =>
  apiClient.get(`${BASE}/me/${id}/download`);

export const acknowledgeMyLetter = async (id: string): Promise<ApiResponse<IssuedLetter>> =>
  apiClient.post(`${BASE}/me/${id}/acknowledge`);
