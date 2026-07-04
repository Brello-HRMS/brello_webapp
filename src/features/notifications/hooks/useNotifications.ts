import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getAllNotifications,
  getUnreadCount,
  getPreferences,
  updatePreference,
  markAllAsRead,
  markAsRead,
} from '../api/notificationApi';

export const NOTIFICATIONS_KEY = ['notifications'] as const;
export const UNREAD_COUNT_KEY = [...NOTIFICATIONS_KEY, 'unread-count'] as const;

export const useNotifications = () => {
  return useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: getAllNotifications,
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: UNREAD_COUNT_KEY,
    queryFn: getUnreadCount,
    // SSE (useNotificationStream) keeps this fresh in real time.
    // 5-minute stale refetch as a resilience backstop if SSE reconnects.
    staleTime: 5 * 60 * 1000,
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: () => {
      // Invalidating NOTIFICATIONS_KEY cascades to UNREAD_COUNT_KEY too
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
    },
  });
};

export const PREFERENCES_KEY = [...NOTIFICATIONS_KEY, 'preferences'] as const;

export const usePreferences = () =>
  useQuery({ queryKey: PREFERENCES_KEY, queryFn: getPreferences });

export const useUpdatePreference = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      channel,
      event_type,
      enabled,
    }: {
      channel: 'IN_APP' | 'EMAIL' | 'PUSH';
      event_type: string;
      enabled: boolean;
    }) => updatePreference(channel, event_type, enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PREFERENCES_KEY });
    },
  });
};
