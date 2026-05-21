import { apiClient } from '../../../lib/axios';
import { envVars } from '../../../utils/envVars';

import type {
  SearchResponse,
  SaveRecentSearchPayload,
  RecentSearchItems,
} from '../types/search.types';

const BASE = envVars.BRELLO_BASE_API;

export const searchGlobal = (q: string, signal?: AbortSignal): Promise<SearchResponse> =>
  apiClient.get(`${BASE}/search`, { params: { q }, signal });

export const getRecentSearches = (): Promise<RecentSearchItems> =>
  apiClient.get(`${BASE}/search/recent`);

export const saveRecentSearch = (payload: SaveRecentSearchPayload): Promise<void> =>
  apiClient.post(`${BASE}/search/recent`, payload);
