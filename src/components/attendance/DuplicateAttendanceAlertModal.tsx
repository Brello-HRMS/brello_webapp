import React from 'react';
import { Calendar } from 'lucide-react';

import styles from './DuplicateAttendanceAlertModal.module.scss';

interface DuplicateAttendanceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  date?: string;
}

const DuplicateAttendanceAlertModal: React.FC<DuplicateAttendanceAlertModalProps> = ({
  isOpen,
  onClose,
  date = 'October 24, 2025',
}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconContainer}>
          <Calendar size={32} />
        </div>

        <h2 className={styles.title}>Duplicate Attendance Alert</h2>
        <p className={styles.description}>
          Attendance already exists for this day. Creating a new entry will replace the current data
          for {date}.
        </p>

        <div className={styles.logBox}>
          <span>Check-in: 09:15 AM • Full Day</span>
        </div>

        <div className={styles.footer}>
          <button className={styles.overrideBtn}>Override Existing</button>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateAttendanceAlertModal;
