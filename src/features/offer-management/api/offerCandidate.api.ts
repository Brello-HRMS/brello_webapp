import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type { ApiResponse } from '../../../types/common';
import type {
  OfferCandidate,
  CreateOfferCandidateParams,
  UpdateOfferCandidateParams,
  CandidateFilters,
} from '../types/offerTypes';

const BASE = `${envVars.BRELLO_BASE_API}/offer-management/candidates`;

export const getOfferCandidates = (
  filters?: CandidateFilters,
): Promise<ApiResponse<OfferCandidate[]>> => apiClient.get(BASE, { params: filters });

export const getOfferCandidate = (id: string): Promise<ApiResponse<OfferCandidate>> =>
  apiClient.get(`${BASE}/${id}`);

export const createOfferCandidate = (
  params: CreateOfferCandidateParams,
): Promise<ApiResponse<OfferCandidate>> => apiClient.post(BASE, params);

export const updateOfferCandidate = (
  id: string,
  params: UpdateOfferCandidateParams,
): Promise<ApiResponse<OfferCandidate>> => apiClient.patch(`${BASE}/${id}`, params);
