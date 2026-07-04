import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import {
  mapNotification,
  type RawNotification,
} from '../features/notifications/api/notificationApi';
import {
  NOTIFICATIONS_KEY,
  UNREAD_COUNT_KEY,
} from '../features/notifications/hooks/useNotifications';
import { getAuthResponse } from '../utils/authUtils';
import { envVars } from '../utils/envVars';

import type { Notification } from '../features/notifications/types/notificationTypes';

/**
 * Opens an SSE connection to receive real-time in-app notifications.
 * Mount this once inside the authenticated layout — it stays alive for the
 * session and pushes incoming notifications into the React Query cache,
 * so the notification panel and bell badge update without a page refresh.
 *
 * The JWT is passed as a query param because EventSource cannot set headers.
 */
export function useNotificationStream(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    const token: string | undefined = getAuthResponse()?.data?.access_token;
    if (!token) return;

    const url = `${envVars.BRELLO_BASE_API}/notifications/stream?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);

    es.onmessage = (event) => {
      try {
        const raw: RawNotification = JSON.parse(event.data as string);
        const notification = mapNotification(raw);

        queryClient.setQueryData<Notification[]>(NOTIFICATIONS_KEY, (prev = []) => [
          notification,
          ...prev,
        ]);

        queryClient.setQueryData<number>(UNREAD_COUNT_KEY, (prev = 0) => prev + 1);
      } catch {
        // ignore malformed SSE payloads
      }
    };

    es.onerror = () => {
      // EventSource auto-reconnects; we don't need to do anything here.
      // Closing on error would prevent reconnection, so we intentionally leave it open.
    };

    return () => {
      es.close();
    };
  }, [queryClient]);
}
