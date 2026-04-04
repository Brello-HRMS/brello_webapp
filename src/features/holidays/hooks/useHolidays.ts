import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '../../ToastFeature/ShowToast';
import {
  getCalendars,
  createCalendar,
  activateCalendar,
  deleteCalendar,
  getCalendarHolidays,
  addHoliday,
  deleteHoliday,
  getUpcomingHolidays,
} from '../api/holidayApi';

import type { ApiError } from '../../../types/common';
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import type {
  CalendarResponse,
  SingleCalendarResponse,
  Holiday,
  HolidayResponse,
  MonthViewResponse,
  EmployeeHolidaysResponse,
  CreateCalendarRequest,
  AddHolidayRequest,
} from '../types';

// --- Hooks ---

export const useCalendars = (
  year?: number,
  options?: Omit<UseQueryOptions<CalendarResponse, Error>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['holidays', 'calendars', year ?? 'all'],
    queryFn: async () => {
      try {
        return await getCalendars(year);
      } catch (error) {
        const message =
          (error as unknown as ApiError)?.message || 'Failed to fetch holiday calendars';
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
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['holidays', 'calendars'] });
      showToast('Calendar created successfully', 'success');
      options?.onSuccess?.(...args);
    },
    onError: (error) => {
      const message = (error as unknown as ApiError)?.message || 'Failed to create calendar';
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
      const message = (error as unknown as ApiError)?.message || 'Failed to activate calendar';
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
      const message = (error as unknown as ApiError)?.message || 'Failed to delete calendar';
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
        const message = (error as unknown as ApiError)?.message || 'Failed to fetch holidays';
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
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['holidays', 'calendar', id] });
      queryClient.invalidateQueries({ queryKey: ['holidays', 'calendars'] });
      showToast('Holiday added successfully', 'success');
      options?.onSuccess?.(...args);
    },
    onError: (error) => {
      const message = (error as unknown as ApiError)?.message || 'Failed to add holiday';
      showToast(message, 'error');
    },
  });
};

export const useDeleteHoliday = (calendarId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays', 'calendar', calendarId] });
      queryClient.invalidateQueries({ queryKey: ['holidays', 'calendars'] });
      showToast('Holiday deleted successfully', 'success');
    },
    onError: (error) => {
      const message = (error as unknown as ApiError)?.message || 'Failed to delete holiday';
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
        const message =
          (error as unknown as ApiError)?.message || 'Failed to fetch upcoming holidays';
        showToast(message, 'error');
        throw error;
      }
    },
    ...options,
  });
};
