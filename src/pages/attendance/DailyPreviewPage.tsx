import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MoreVertical,
  ArrowUpDown,
} from 'lucide-react';

import AddManualEntryModal from '../../components/attendance/AddManualEntryModal';

import styles from './DailyPreviewPage.module.scss';

import type { AttendanceRecord, AttendanceStats } from '../../types/attendance';

const DUMMY_DATA: AttendanceRecord[] = [
  {
    id: '1',
    employee: {
      id: 'EMP001',
      name: 'John Doe',
      role: 'Senior Product Designer',
      avatar: 'https://i.pravatar.cc/150?u=EMP001',
    },
    date: '27 Oct, 2025',
    checkIn: '09:00 AM',
    checkOut: '05:30 PM',
    totalHours: '8h 30m',
    status: 'Present',
    notes: 'Regular shift',
  },
  {
    id: '2',
    employee: {
      id: 'EMP002',
      name: 'Sarah Smith',
      role: 'Frontend Developer',
      avatar: 'https://i.pravatar.cc/150?u=EMP002',
    },
    date: '27 Oct, 2025',
    checkIn: '09:15 AM',
    checkOut: '06:00 PM',
    totalHours: '8h 45m',
    status: 'Late',
    notes: 'Traffic delay',
  },
  {
    id: '3',
    employee: {
      id: 'EMP003',
      name: 'Michael Brown',
      role: 'Backend Engineer',
      avatar: 'https://i.pravatar.cc/150?u=EMP003',
    },
    date: '27 Oct, 2025',
    checkIn: '09:00 AM',
    checkOut: '01:00 PM',
    totalHours: '4h 00m',
    status: 'Half-day',
    notes: 'Doctor appointment',
  },
  {
    id: '4',
    employee: {
      id: 'EMP004',
      name: 'Emily Davis',
      role: 'UI Designer',
      avatar: 'https://i.pravatar.cc/150?u=EMP004',
    },
    date: '27 Oct, 2025',
    checkIn: '-',
    checkOut: '-',
    totalHours: '0h 00m',
    status: 'Absent',
    notes: 'Sick leave',
  },
  // Add more entries to make it look like 167 entries
  ...Array.from({ length: 6 }).map((_, i) => ({
    id: `${i + 5}`,
    employee: {
      id: `EMP00${i + 5}`,
      name: `Employee ${i + 5}`,
      role: 'Team Member',
      avatar: `https://i.pravatar.cc/150?u=EMP00${i + 5}`,
    },
    date: '27 Oct, 2025',
    checkIn: '09:00 AM',
    checkOut: '05:00 PM',
    totalHours: '8h 00m',
    status: 'Present' as const,
    notes: '-',
  })),
];

const STATS: AttendanceStats = {
  totalPresent: 142,
  totalAbsent: 12,
  lateArrivals: 8,
  halfDays: 5,
  totalEntries: 167,
};

const DailyPreviewPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Present':
        return styles.present;
      case 'Late':
        return styles.late;
      case 'Half-day':
        return styles.halfDay;
      case 'Absent':
        return styles.absent;
      default:
        return '';
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Daily Preview</h1>
        <div className={styles.dateSelector}>
          <CalendarIcon size={16} />
          <span>27 Oct, 2025</span>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Present</span>
          <span className={styles.statValue}>{STATS.totalPresent}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Absent</span>
          <span className={styles.statValue}>{STATS.totalAbsent}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Late Arrivals</span>
          <span className={styles.statValue}>{STATS.lateArrivals}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Half-Day</span>
          <span className={styles.statValue}>{STATS.halfDays}</span>
        </div>
      </div>

      <section className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <div className={styles.titleRow}>
            <h2>Employee Attendance - {STATS.totalEntries} Entries</h2>
            <button className={styles.addEntryBtn} onClick={() => setIsModalOpen(true)}>
              <Plus size={18} />
              Add manual entry
            </button>
          </div>

          <div className={styles.controlsRow}>
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} size={18} />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className={styles.filterGroup}>
              <button className={styles.iconBtn} title="Filter">
                <Filter size={18} />
              </button>
              <button className={styles.iconBtn} title="Sort">
                <ArrowUpDown size={18} />
              </button>
              <button className={styles.iconBtn} title="Export">
                <Download size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Total hours</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {DUMMY_DATA.map((record) => (
                <tr key={record.id}>
                  <td>
                    <div className={styles.employeeCell}>
                      <img
                        src={record.employee.avatar}
                        alt={record.employee.name}
                        className={styles.avatar}
                      />
                      <div className={styles.info}>
                        <span className={styles.name}>{record.employee.name}</span>
                        <span className={styles.role}>
                          {record.employee.id} • {record.employee.role}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td>{record.date}</td>
                  <td>{record.checkIn}</td>
                  <td>{record.checkOut}</td>
                  <td>{record.totalHours}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td>{record.notes || '-'}</td>
                  <td>
                    <button className={styles.iconBtn}>
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <span className={styles.pageInfo}>Showing 1 to 10 of {STATS.totalEntries} entries</span>
          <div className={styles.pageActions}>
            <button className={styles.iconBtn} disabled>
              <ChevronLeft size={18} />
            </button>
            <button className={styles.iconBtn}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      <AddManualEntryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default DailyPreviewPage;
