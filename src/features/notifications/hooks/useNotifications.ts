import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getAllNotifications,
  getUnreadCount,
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
