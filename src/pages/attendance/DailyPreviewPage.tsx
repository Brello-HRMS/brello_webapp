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
import { useDailyPreview } from '../../features/attendance/hooks/useAttendance';

import styles from './DailyPreviewPage.module.scss';

import type { DailyPreviewSummary } from '../../features/attendance/types';

const DEFAULT_STATS: DailyPreviewSummary = {
  present: 0,
  absent: 0,
  late: 0,
  half_day: 0,
  on_leave: 0,
  missed_checkout: 0,
  office_in: 0,
  remote_in: 0,
  geo_violations: 0,
};

const DailyPreviewPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const { data: response, isLoading } = useDailyPreview({
    date: currentDate,
    search: searchTerm,
    page,
    limit: 20,
  });

  const records = response?.data?.items || [];
  const stats = response?.data?.summary || DEFAULT_STATS;

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusClass = (status: string) => {
    if (!status) return '';
    switch (status.toUpperCase()) {
      case 'PRESENT':
      case 'OVERTIME':
        return styles.present;
      case 'LATE':
        return styles.late;
      case 'HALF_DAY':
      case 'HALF-DAY':
        return styles.halfDay;
      case 'ABSENT':
      case 'MISSED_CHECKOUT':
        return styles.absent;
      default:
        return '';
    }
  };

  const formatStatus = (status: string) => {
    if (!status) return '-';
    switch (status.toUpperCase()) {
      case 'PRESENT':
        return 'Present';
      case 'LATE':
        return 'Late';
      case 'HALF_DAY':
      case 'HALF-DAY':
        return 'Half-day';
      case 'ABSENT':
        return 'Absent';
      case 'ON_LEAVE':
        return 'On Leave';
      case 'HOLIDAY':
        return 'Holiday';
      case 'WEEKLY_OFF':
        return 'Weekly Off';
      case 'MISSED_CHECKOUT':
        return 'Missed Checkout';
      case 'OVERTIME':
        return 'Overtime';
      case 'PENDING_APPROVAL':
        return 'Pending';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace(/_/g, ' ');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Daily Preview</h1>
        <div className={styles.dateSelector} style={{ position: 'relative' }}>
          <CalendarIcon size={16} />
          <span>{formatDateDisplay(currentDate)}</span>
          <input
            type="date"
            value={currentDate}
            onChange={(e) => {
              setCurrentDate(e.target.value);
              setPage(1);
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer',
            }}
          />
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Present</span>
          <span className={styles.statValue}>{stats.present}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Absent</span>
          <span className={styles.statValue}>{stats.absent}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Late Arrivals</span>
          <span className={styles.statValue}>{stats.late}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Half-Day</span>
          <span className={styles.statValue}>{stats.half_day}</span>
        </div>
      </div>

      <section className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <div className={styles.titleRow}>
            <h2>Employee Attendance </h2>
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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
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
              {isLoading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '24px' }}>
                    Loading...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '24px' }}>
                    No records found
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.attendance_id}>
                    <td>
                      <div className={styles.employeeCell}>
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(record.employee.name)}&background=random`}
                          alt={record.employee.name}
                          className={styles.avatar}
                        />
                        <div className={styles.info}>
                          <span className={styles.name}>{record.employee.name}</span>
                          <span className={styles.role}>
                            {record.employee.emp_code} •{' '}
                            {record.employee.department || 'No Department'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>{record.date}</td>
                    <td>{record.check_in || '-'}</td>
                    <td>{record.check_out || '-'}</td>
                    <td>{record.worked_hours || '-'}</td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${getStatusClass(record.attendance_status)}`}
                      >
                        {formatStatus(record.attendance_status)}
                      </span>
                    </td>
                    <td>{record.notes || '-'}</td>
                    <td>
                      <button className={styles.iconBtn}>
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <span className={styles.pageInfo}>
            Showing {records.length > 0 ? (page - 1) * 20 + 1 : 0} to{' '}
            {Math.min(page * 20, response?.data?.pagination?.total || 0)} of{' '}
            {response?.data?.pagination?.total || 0} entries
          </span>
          <div className={styles.pageActions}>
            <button
              className={styles.iconBtn}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className={styles.iconBtn}
              disabled={!response?.data?.pagination || page * 20 >= response.data.pagination.total}
              onClick={() => setPage((p) => p + 1)}
            >
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
