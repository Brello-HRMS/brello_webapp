import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getRecentSearches, saveRecentSearch } from '../api/search';

import type { RecentSearchItems, SaveRecentSearchPayload } from '../types/search.types';

export const useRecentSearches = (enabled: boolean) => {
  return useQuery<RecentSearchItems, Error>({
    queryKey: ['search', 'recent'],
    queryFn: getRecentSearches,
    enabled,
    staleTime: 60_000,
  });
};

export const useSaveRecentSearch = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, SaveRecentSearchPayload>({
    mutationFn: saveRecentSearch,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['search', 'recent'] });
    },
  });
};
