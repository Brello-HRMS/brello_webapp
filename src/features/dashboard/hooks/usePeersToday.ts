import { useQuery } from '@tanstack/react-query';

import { getPeersToday } from '../../../api/attendance';

export const usePeersToday = () => {
  const query = useQuery({
    queryKey: ['peers-today'],
    queryFn: getPeersToday,
  });

  return {
    peers: query.data ?? [],
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
  };
};
