import { useQuery } from '@tanstack/react-query';

import { getNewHires } from '../../../api/employees';

export const useNewHires = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'new-hires'],
    queryFn: getNewHires,
  });

  return {
    hires: data ?? [],
    loading: isLoading,
    error: error ? ((error as { message?: string }).message ?? 'Failed to load new hires') : null,
  };
};
