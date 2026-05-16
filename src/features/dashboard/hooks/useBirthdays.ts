import { useQuery } from '@tanstack/react-query';

import { getBirthdays } from '../../../api/employees';

export const useBirthdays = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'birthdays'],
    queryFn: () => getBirthdays(),
  });

  return {
    birthdays: data ?? [],
    loading: isLoading,
    error: error ? ((error as { message?: string }).message ?? 'Failed to load birthdays') : null,
  };
};
