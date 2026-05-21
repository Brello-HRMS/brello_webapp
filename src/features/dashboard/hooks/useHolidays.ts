import { useQuery } from '@tanstack/react-query';

import { getHolidays } from '../../../api/holidays';

import type { Holiday } from '../types/dashboardTypes';

export const useHolidays = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-based

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'holidays', currentYear],
    queryFn: () => getHolidays(currentYear),
  });

  const holidays: Holiday[] = (data?.all ?? [])
    .filter((h) => {
      const d = new Date(h.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    })
    .map((h) => ({
      id: h.id,
      name: h.name,
      dayOfWeek: h.day,
      date: new Date(h.date).getDate(),
    }));

  return {
    holidays,
    loading: isLoading,
    error: error ? ((error as { message?: string }).message ?? 'Failed to load holidays') : null,
  };
};
