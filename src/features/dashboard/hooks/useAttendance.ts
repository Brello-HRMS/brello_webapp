import { useState, useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { clockIn, clockOut, getTodayAttendance, preCheckCheckIn } from '../../../api/attendance';
import { todayLocalDate } from '../../../utils/timeUtils';

import type { TodayAttendance, PreCheckResponse } from '../../../api/attendance';

const pad = (n: number) => String(n).padStart(2, '0');

function parseDurationToSeconds(duration: string): number {
  const parts = duration.split(':').map(Number);
  return (parts[0] ?? 0) * 3600 + (parts[1] ?? 0) * 60 + (parts[2] ?? 0);
}

function formatShiftTime(time: string): string {
  const [hStr, mStr] = time.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${pad(m)} ${suffix}`;
}

export type LocationStatus = 'requesting' | 'granted' | 'denied' | 'unavailable';

interface Coords {
  latitude: number;
  longitude: number;
}

export const useAttendance = () => {
  const queryClient = useQueryClient();
  const [today, setToday] = useState<TodayAttendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('requesting');
  const [isPreCheckModalOpen, setIsPreCheckModalOpen] = useState(false);
  const [preCheckData, setPreCheckData] = useState<PreCheckResponse | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Request location permission on mount — mandatory for geo-fenced attendance
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationStatus('granted');
      },
      () => {
        setLocationStatus('denied');
      },
    );
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const fetchToday = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTodayAttendance();
      setToday(data);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      const seconds = parseDurationToSeconds(data.worked_duration_live);
      setElapsedSeconds(seconds);

      if (data.live_session) {
        intervalRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
      }
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchToday();
  }, [fetchToday]);

  const handleConfirmCheckIn = useCallback(
    async (reason?: string) => {
      setActionLoading(true);
      setError(null);
      try {
        await clockIn({
          device: 'WEB',
          latitude: coords?.latitude,
          longitude: coords?.longitude,
          remote_reason: reason,
        });
        setIsPreCheckModalOpen(false);
        setPreCheckData(null);
        await fetchToday();
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
        queryClient.invalidateQueries({ queryKey: ['admin-daily-preview', todayLocalDate()] });
      } catch (err: unknown) {
        setError((err as { message?: string }).message ?? 'Check-in failed');
      } finally {
        setActionLoading(false);
      }
    },
    [fetchToday, coords, queryClient],
  );

  const handlePreCheck = useCallback(async () => {
    setActionLoading(true);
    setError(null);
    try {
      const result = await preCheckCheckIn(coords?.latitude, coords?.longitude);
      if (result.is_late || (result.is_remote && result.require_remote_reason)) {
        setPreCheckData(result);
        setIsPreCheckModalOpen(true);
        setActionLoading(false);
      } else {
        // Not late and not requiring remote reason -> proceed to check in directly
        handleConfirmCheckIn();
      }
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? 'Check-in pre-check failed');
      setActionLoading(false);
    }
  }, [coords, handleConfirmCheckIn]);

  const handleCheckOut = useCallback(async () => {
    setActionLoading(true);
    setError(null);
    try {
      await clockOut({
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      });
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      await fetchToday();
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-daily-preview', todayLocalDate()] });
    } catch (err: unknown) {
      setError((err as { message?: string }).message ?? 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  }, [fetchToday, coords, queryClient]);

  const h = Math.floor(elapsedSeconds / 3600);
  const m = Math.floor((elapsedSeconds % 3600) / 60);
  const s = elapsedSeconds % 60;

  const shiftDisplay = today?.shift
    ? `${formatShiftTime(today.shift.start_time)} – ${formatShiftTime(today.shift.end_time)}`
    : null;

  return {
    isClockedIn: today?.live_session ?? false,
    formattedTime: `${pad(h)}:${pad(m)}:${pad(s)}`,
    totalTime: `${pad(h)}:${pad(m)}`,
    loading,
    actionLoading,
    error,
    locationStatus,
    checkIn: handlePreCheck,
    checkOut: handleCheckOut,
    shiftDisplay,
    checkInTime: today?.check_in_time ?? null,
    attendanceStatus: today?.attendance_status ?? null,
    isPreCheckModalOpen,
    setIsPreCheckModalOpen,
    preCheckData,
    confirmCheckIn: handleConfirmCheckIn,
  };
};
