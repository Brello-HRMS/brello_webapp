import { useState, useEffect, useRef } from 'react';

const pad = (n: number) => String(n).padStart(2, '0');

export const useClock = () => {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isClockedIn) {
      intervalRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isClockedIn]);

  const toggle = () => {
    if (isClockedIn) {
      setIsClockedIn(false);
    } else {
      setElapsedSeconds(0);
      setIsClockedIn(true);
    }
  };

  const h = Math.floor(elapsedSeconds / 3600);
  const m = Math.floor((elapsedSeconds % 3600) / 60);
  const s = elapsedSeconds % 60;

  return {
    isClockedIn,
    formattedTime: `${pad(h)}:${pad(m)}:${pad(s)}`,
    totalClockInTime: `${pad(h)}:${pad(m)}`,
    toggle,
  };
};
