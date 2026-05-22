import React from 'react';
import { LogIn, LogOut, Loader2, MapPin, MapPinOff } from 'lucide-react';

import { formatFullDate, getDayName } from '../../../../utils/timeUtils';
import { useAttendance } from '../../hooks/useAttendance';

import { LateClockInModal } from './LateClockInModal';
import styles from './ClockInCard.module.scss';

const LOCATION_MESSAGES = {
  requesting: 'Requesting location permission…',
  denied: 'Location access denied. Enable it in your browser to clock in.',
  unavailable: 'Geolocation is not supported by your browser.',
} as const;

export const ClockInCard: React.FC = () => {
  const {
    isClockedIn,
    formattedTime,
    totalTime,
    loading,
    actionLoading,
    error,
    locationStatus,
    checkIn,
    checkOut,
    shiftDisplay,
    checkInTime,
    attendanceStatus,
    isPreCheckModalOpen,
    setIsPreCheckModalOpen,
    preCheckData,
    confirmCheckIn,
  } = useAttendance();

  const locationBlocked = locationStatus === 'denied' || locationStatus === 'unavailable';
  const isDisabled = loading || actionLoading || locationStatus === 'requesting' || locationBlocked;

  return (
    <div className={styles.card}>
      <div className={styles.dateRow}>
        <span className={styles.date}>{formatFullDate()}</span>
        {attendanceStatus && (
          <span
            className={`${styles.statusBadge} ${styles[`status_${attendanceStatus.toLowerCase()}`]}`}
          >
            {attendanceStatus.replace(/_/g, ' ')}
          </span>
        )}
      </div>

      <div className={styles.timer}>{loading ? '--:--:--' : formattedTime}</div>

      <div className={styles.shiftInfo}>
        <span className={styles.shiftDay}>{getDayName()}</span>
        {shiftDisplay && (
          <>
            <span className={styles.separator}>|</span>
            <span className={styles.shiftTime}>{shiftDisplay}</span>
          </>
        )}
      </div>

      {locationStatus !== 'granted' && (
        <p className={`${styles.locationNotice} ${locationBlocked ? styles.locationDenied : ''}`}>
          {locationBlocked ? (
            <MapPinOff size={13} />
          ) : (
            <MapPin size={13} className={styles.pinPulse} />
          )}
          {LOCATION_MESSAGES[locationStatus]}
        </p>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <button
        className={`${styles.clockBtn} ${isClockedIn ? styles.clockOut : styles.clockIn}`}
        onClick={isClockedIn ? checkOut : checkIn}
        disabled={isDisabled}
      >
        {actionLoading ? (
          <Loader2 size={16} className={styles.spinner} />
        ) : isClockedIn ? (
          <LogOut size={16} strokeWidth={2.2} />
        ) : (
          <LogIn size={16} strokeWidth={2.2} />
        )}
        {isClockedIn ? 'Clock Out' : 'Clock In'}
      </button>

      <div className={styles.totalTime}>
        {isClockedIn && checkInTime ? (
          <>
            Checked in at: <span>{checkInTime}</span>
          </>
        ) : (
          <>
            Clock In Today: <span>{loading ? '--:--' : totalTime}</span>
          </>
        )}
      </div>

      {preCheckData && (
        <LateClockInModal
          isOpen={isPreCheckModalOpen}
          onClose={() => setIsPreCheckModalOpen(false)}
          onSubmit={confirmCheckIn}
          preCheckData={preCheckData}
        />
      )}
    </div>
  );
};
