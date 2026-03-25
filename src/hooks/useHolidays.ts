import { useQuery } from '@tanstack/react-query';

import { fetchGoogleHolidays } from '../services/holidayService';

/**
 * Hook to fetch holidays for a specific year.
 */
export const useHolidays = (year: number) => {
  return useQuery({
    queryKey: ['holidays', year],
    queryFn: () => fetchGoogleHolidays(year),
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    placeholderData: (previousData) => previousData,
  });
};
