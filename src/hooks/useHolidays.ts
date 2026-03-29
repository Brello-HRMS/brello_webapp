import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '../lib/axios';
import { envVars } from '../utils/envVars';
import { showToast } from '../features/ToastFeature/ShowToast';

import type { ApiError } from '../types/common';
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import type {
  CalendarResponse,
  SingleCalendarResponse,
  Holiday,
  HolidayResponse,
  MonthViewResponse,
  EmployeeHolidaysResponse,
  CreateCalendarRequest,
  CloneCalendarRequest,
  AddHolidayRequest,
} from '../types/holiday';

// --- API Functions ---

export const getCalendars = async (year: number): Promise<CalendarResponse> => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/holidays/calendars?year=${year}`);
};

export const createCalendar = async (
  data: CreateCalendarRequest,
): Promise<SingleCalendarResponse> => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/holidays/calendars`, data);
};

export const activateCalendar = async (id: string): Promise<SingleCalendarResponse> => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/holidays/calendars/${id}/activate`);
};

export const cloneCalendar = async (
  id: string,
  data: CloneCalendarRequest,
): Promise<SingleCalendarResponse> => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/holidays/calendars/${id}/clone`, data);
};

export const deleteCalendar = async (id: string): Promise<{ success: boolean }> => {
  return apiClient.delete(`${envVars.BRELLO_BASE_API}/holidays/calendars/${id}`);
};

export const getCalendarHolidays = async (
  id: string,
  month?: number,
): Promise<MonthViewResponse | HolidayResponse> => {
  const url =
    month !== undefined
      ? `${envVars.BRELLO_BASE_API}/holidays/calendars/${id}/month-view?month=${month}`
      : `${envVars.BRELLO_BASE_API}/holidays/calendars/${id}/holidays`;
  return apiClient.get(url);
};

export const addHoliday = async (
  id: string,
  data: AddHolidayRequest,
): Promise<{ success: boolean; data: Holiday }> => {
  return apiClient.post(`${envVars.BRELLO_BASE_API}/holidays/calendars/${id}/holidays`, data);
};

export const getUpcomingHolidays = async (): Promise<EmployeeHolidaysResponse> => {
  return apiClient.get(`${envVars.BRELLO_BASE_API}/employee/holidays`);
};

// --- Hooks ---

export const useCalendars = (
  year: number,
  options?: Omit<UseQueryOptions<CalendarResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['holidays', 'calendars', year],
    queryFn: async () => {
      try {
        return await getCalendars(year);
      } catch (error) {
        const message = (error as ApiError)?.message || 'Failed to fetch holiday calendars';
        showToast(message, 'error');
        throw error;
      }
    },
    ...options,
  });
};

export const useCreateCalendar = (
  options?: UseMutationOptions<SingleCalendarResponse, Error, CreateCalendarRequest>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCalendar,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['holidays', 'calendars'] });
      showToast('Calendar created successfully', 'success');
      options?.onSuccess?.(data, {} as CreateCalendarRequest, undefined);
    },
    onError: (error) => {
      const message = (error as ApiError)?.message || 'Failed to create calendar';
      showToast(message, 'error');
    },
  });
};

export const useActivateCalendar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: activateCalendar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays', 'calendars'] });
      showToast('Calendar activated successfully', 'success');
    },
    onError: (error) => {
      const message = (error as ApiError)?.message || 'Failed to activate calendar';
      showToast(message, 'error');
    },
  });
};

export const useCloneCalendar = (
  options?: UseMutationOptions<
    SingleCalendarResponse,
    Error,
    { id: string; data: CloneCalendarRequest }
  >,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => cloneCalendar(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['holidays', 'calendars'] });
      showToast('Calendar cloned successfully', 'success');
      options?.onSuccess?.(data, {} as { id: string; data: CloneCalendarRequest }, undefined);
    },
    onError: (error) => {
      const message = (error as ApiError)?.message || 'Failed to clone calendar';
      showToast(message, 'error');
    },
  });
};

export const useDeleteCalendar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCalendar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays', 'calendars'] });
      showToast('Calendar deleted successfully', 'success');
    },
    onError: (error) => {
      const message = (error as ApiError)?.message || 'Failed to delete calendar';
      showToast(message, 'error');
    },
  });
};

export const useCalendarHolidays = (
  id: string,
  month?: number,
  options?: Omit<UseQueryOptions<Holiday[], Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['holidays', 'calendar', id, month],
    queryFn: async () => {
      try {
        const response = await getCalendarHolidays(id, month);
        if (response.data && typeof response.data === 'object' && 'days' in response.data) {
          // Flatten month-view days into a single holiday list
          return (response as MonthViewResponse).data.days.flatMap((day) =>
            day.holidays.map((h) => ({ ...h, date: day.date })),
          );
        }
        return (response as HolidayResponse).data || [];
      } catch (error) {
        const message = (error as ApiError)?.message || 'Failed to fetch holidays';
        showToast(message, 'error');
        throw error;
      }
    },
    enabled: !!id,
    ...options,
  });
};

export const useAddHoliday = (
  id: string,
  options?: UseMutationOptions<{ success: boolean; data: Holiday }, Error, AddHolidayRequest>,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AddHolidayRequest) => addHoliday(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['holidays', 'calendar', id] });
      showToast('Holiday added successfully', 'success');
      options?.onSuccess?.(data, {} as AddHolidayRequest, undefined);
    },
    onError: (error) => {
      const message = (error as ApiError)?.message || 'Failed to add holiday';
      showToast(message, 'error');
    },
  });
};

export const useUpcomingHolidays = (
  options?: Omit<UseQueryOptions<EmployeeHolidaysResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['holidays', 'upcoming'],
    queryFn: async () => {
      try {
        return await getUpcomingHolidays();
      } catch (error) {
        const message = (error as ApiError)?.message || 'Failed to fetch upcoming holidays';
        showToast(message, 'error');
        throw error;
      }
    },
    ...options,
  });
};
