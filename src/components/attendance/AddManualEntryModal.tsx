import React, { useState, useEffect } from 'react';

import { Dialog, Button, Select, TimePicker } from '../common';
import { showToast } from '../../features/ToastFeature/ShowToast';
import { useEmployees } from '../../features/employee/hooks/useEmployees';
import { useManualEntry } from '../../features/attendance/hooks/useAttendance';

import styles from './AddManualEntryModal.module.scss';

interface AddManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const calculateTotalHours = (start: string, end: string): string => {
  if (!start || !end) return '0h 0m';
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);

  if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) {
    return '0h 0m';
  }

  const diffMinutes = endH * 60 + endM - (startH * 60 + startM);
  if (diffMinutes < 0) {
    return '0h 0m';
  }

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  return `${hours}h ${minutes}m`;
};

const AddManualEntryModal: React.FC<AddManualEntryModalProps> = ({ isOpen, onClose }) => {
  const [employee, setEmployee] = useState('');
  const [attendanceMode, setAttendanceMode] = useState<'OFFICE_IN' | 'REMOTE_IN'>('OFFICE_IN');
  const [remoteReason, setRemoteReason] = useState('');
  const [date, setDate] = useState('');
  const [checkIn, setCheckIn] = useState('09:00');
  const [checkOut, setCheckOut] = useState('17:35');
  const [notes, setNotes] = useState('');

  // Validation states
  const [employeeError, setEmployeeError] = useState('');
  const [dateError, setDateError] = useState('');
  const [checkInError, setCheckInError] = useState('');
  const [checkOutError, setCheckOutError] = useState('');

  const { data: employeesResponse, isLoading: isEmployeesLoading } = useEmployees({ limit: 1000 });
  const employeeOptions =
    employeesResponse?.data?.data?.map((emp) => ({
      value: emp.id,
      label: `${emp.firstName} ${emp.lastName}`,
    })) || [];

  const { mutate: addManualEntry, isPending } = useManualEntry();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setEmployee('');
        setAttendanceMode('OFFICE_IN');
        setRemoteReason('');
        setDate('');
        setCheckIn('09:00');
        setCheckOut('17:35');
        setNotes('');
        setEmployeeError('');
        setDateError('');
        setCheckInError('');
        setCheckOutError('');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Validate check-in and check-out reactive changes inline during render
  const isTimeError =
    checkIn &&
    checkOut &&
    (() => {
      const [inH, inM] = checkIn.split(':').map(Number);
      const [outH, outM] = checkOut.split(':').map(Number);
      const inMinutes = inH * 60 + inM;
      const outMinutes = outH * 60 + outM;
      return outMinutes < inMinutes;
    })();

  const effectiveCheckOutError = isTimeError
    ? 'End time cannot be earlier than start time'
    : checkOutError;

  const handleSave = () => {
    let hasError = false;

    if (!employee) {
      setEmployeeError('Employee is required');
      hasError = true;
    } else {
      setEmployeeError('');
    }

    if (!date) {
      setDateError('Date is required');
      hasError = true;
    } else {
      setDateError('');
    }

    if (!checkIn) {
      setCheckInError('Check-in time is required');
      hasError = true;
    } else {
      setCheckInError('');
    }

    if (!checkOut) {
      setCheckOutError('Check-out time is required');
      hasError = true;
    } else {
      setCheckOutError('');
    }

    if (isTimeError) {
      setCheckOutError('End time cannot be earlier than start time');
      hasError = true;
    }

    if (hasError) {
      showToast('Please correct validation errors', 'error');
      return;
    }

    addManualEntry(
      {
        employee_id: employee,
        date,
        check_in: checkIn,
        check_out: checkOut,
        attendance_mode: attendanceMode,
        remote_reason: attendanceMode === 'REMOTE_IN' ? remoteReason.trim() || null : null,
        notes: notes.trim(),
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  const actions = (
    <div className={styles.footer}>
      <Button variant="secondary" onClick={onClose} disabled={isPending}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSave} disabled={isPending || isEmployeesLoading}>
        {isPending ? 'Saving...' : 'Save Entry'}
      </Button>
    </div>
  );

  return (
    <Dialog
      title="Add Manual Entry"
      open={isOpen}
      onClose={onClose}
      actions={actions}
      position="right"
      maxWidth="500px"
    >
      <div className={styles.body}>
        <Select
          label="Employee"
          required
          options={employeeOptions}
          value={employee}
          onChange={(val) => {
            setEmployee(String(val));
            if (val) setEmployeeError('');
          }}
          placeholder={isEmployeesLoading ? 'Loading employees...' : 'Select Employee'}
          disabled={isEmployeesLoading || isPending}
          error={employeeError}
        />

        <div className={styles.formGroup}>
          <label>
            Date<span className={styles.required}>*</span>
          </label>
          <div className={`${styles.inputWrapper} ${dateError ? styles.hasError : ''}`}>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (e.target.value) setDateError('');
              }}
            />
          </div>
          {dateError && <span className={styles.errorMessage}>{dateError}</span>}
        </div>

        <div className={styles.row}>
          <TimePicker
            label="Check-in"
            required
            value={checkIn}
            onChange={(val) => {
              setCheckIn(val);
              if (val) setCheckInError('');
            }}
            error={checkInError}
          />
          <TimePicker
            label="Check-out"
            required
            value={checkOut}
            onChange={(val) => {
              setCheckOut(val);
              if (val) setCheckOutError('');
            }}
            error={effectiveCheckOutError}
          />
        </div>

        <div className={styles.calculatedHours}>
          <span className={styles.label}>Calculated Total Hours</span>
          <span className={styles.value}>{calculateTotalHours(checkIn, checkOut)}</span>
        </div>

        <div className={styles.formGroup}>
          <label>
            Attendance Mode<span className={styles.required}>*</span>
          </label>
          <div className={styles.statusOptions}>
            <div
              className={`${styles.statusOption} ${styles.officeMode} ${attendanceMode === 'OFFICE_IN' ? styles.active : ''}`}
              onClick={() => setAttendanceMode('OFFICE_IN')}
            >
              <div className={styles.dot}></div> Office
            </div>
            <div
              className={`${styles.statusOption} ${styles.remoteMode} ${attendanceMode === 'REMOTE_IN' ? styles.active : ''}`}
              onClick={() => setAttendanceMode('REMOTE_IN')}
            >
              <div className={styles.dot}></div> Remote
            </div>
          </div>
        </div>

        {attendanceMode === 'REMOTE_IN' && (
          <div className={styles.formGroup}>
            <label>Remote Reason</label>
            <div className={styles.inputWrapper}>
              <textarea
                rows={2}
                placeholder="Enter reason for remote work..."
                value={remoteReason}
                onChange={(e) => setRemoteReason(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className={styles.formGroup}>
          <label>Notes</label>
          <div className={styles.inputWrapper}>
            <textarea
              rows={3}
              placeholder="Add supporting notes for this attendance update..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default AddManualEntryModal;
