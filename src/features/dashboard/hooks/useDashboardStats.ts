import { useQuery } from '@tanstack/react-query';

import { getDashboardStats } from '../../../api/employees';

export const useDashboardStats = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats,
    staleTime: 5 * 60 * 1000, // refresh every 5 minutes
  });

  return {
    totalEmployees: data?.total_employees ?? null,
    employeeTrend: data?.employee_trend ?? null,
    attendancePercent: data?.attendance_percent ?? null,
    attendanceTrend: data?.attendance_trend ?? null,
    loading: isLoading,
  };
};
