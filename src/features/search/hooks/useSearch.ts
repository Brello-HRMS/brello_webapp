import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { searchGlobal } from '../api/search';

import type { SearchResponse } from '../types/search.types';

export const useSearch = (query: string) => {
  return useQuery<SearchResponse, Error>({
    queryKey: ['search', query],
    queryFn: ({ signal }) => searchGlobal(query, signal),
    enabled: query.trim().length > 0,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
};
