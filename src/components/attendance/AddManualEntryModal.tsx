import React, { useState } from 'react';

import { Dialog, Button, Select } from '../common';

import styles from './AddManualEntryModal.module.scss';

import type { AttendanceStatus } from '../../types/attendance';

const EMPLOYEE_OPTIONS = [
  { value: '1', label: 'John Doe (EMP001)' },
  { value: '2', label: 'Sarah Smith (EMP002)' },
  { value: '3', label: 'Michael Brown (EMP003)' },
];

interface AddManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddManualEntryModal: React.FC<AddManualEntryModalProps> = ({ isOpen, onClose }) => {
  const [employee, setEmployee] = useState('');
  const [status, setStatus] = useState<AttendanceStatus>('Present');
  const [date, setDate] = useState('2025-10-24');
  const [checkIn, setCheckIn] = useState('09:00');
  const [checkOut, setCheckOut] = useState('17:35');

  const actions = (
    <div className={styles.footer}>
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={() => {
          onClose();
        }}
      >
        Save Entry
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
          options={EMPLOYEE_OPTIONS}
          value={employee}
          onChange={(val) => setEmployee(String(val))}
          placeholder="Select Employee"
        />

        <div className={styles.formGroup}>
          <label>
            Date<span className={styles.required}>*</span>
          </label>
          <div className={styles.inputWrapper}>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label>
              Check-in<span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <input type="time" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>
              Check-out<span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <input type="time" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
            </div>
          </div>
        </div>

        <div className={styles.calculatedHours}>
          <span className={styles.label}>Calculated Total Hours</span>
          <span className={styles.value}>8h 35m</span>
        </div>

        <div className={styles.formGroup}>
          <label>
            Attendance Status<span className={styles.required}>*</span>
          </label>
          <div className={styles.statusOptions}>
            <div
              className={`${styles.statusOption} ${styles.present} ${status === 'Present' ? styles.active : ''}`}
              onClick={() => setStatus('Present')}
            >
              <div className={styles.dot}></div> Present
            </div>
            <div
              className={`${styles.statusOption} ${styles.late} ${status === 'Late' ? styles.active : ''}`}
              onClick={() => setStatus('Late')}
            >
              <div className={styles.dot}></div> Late
            </div>
            <div
              className={`${styles.statusOption} ${styles.halfDay} ${status === 'Half-day' ? styles.active : ''}`}
              onClick={() => setStatus('Half-day')}
            >
              <div className={styles.dot}></div> Half-day
            </div>
            <div
              className={`${styles.statusOption} ${styles.absent} ${status === 'Absent' ? styles.active : ''}`}
              onClick={() => setStatus('Absent')}
            >
              <div className={styles.dot}></div> Absent
            </div>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>
            Notes (Optional)<span className={styles.required}>*</span>
          </label>
          <div className={styles.inputWrapper}>
            <textarea rows={3} placeholder="Add supporting notes for this attendance update..." />
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default AddManualEntryModal;
