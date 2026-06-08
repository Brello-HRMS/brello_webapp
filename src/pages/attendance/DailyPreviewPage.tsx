import React, { useState, useMemo } from 'react';
import { Plus, MoreVertical, CalendarCheck, CalendarX, Clock, Hourglass } from 'lucide-react';

import AddManualEntryModal from '../../components/attendance/AddManualEntryModal';
import { useDailyPreview } from '../../features/attendance/hooks/useAttendance';
import {
  ListControls,
  PageHeader,
  Button,
  ExcelExport,
  NoDataFound,
} from '../../components/common';
import { DatePicker } from '../../components/ui/DatePicker/DatePicker';

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

const FILTER_OPTIONS = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Present', value: 'PRESENT' },
  { label: 'Absent', value: 'ABSENT' },
  { label: 'Late', value: 'LATE' },
  { label: 'Half-day', value: 'HALF_DAY' },
  { label: 'On Leave', value: 'ON_LEAVE' },
  { label: 'Missed Checkout', value: 'MISSED_CHECKOUT' },
];

const SORT_OPTIONS = [
  { label: 'Name (A-Z)', value: 'name_asc' },
  { label: 'Name (Z-A)', value: 'name_desc' },
  { label: 'Emp Code (A-Z)', value: 'code_asc' },
];

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

const DailyPreviewPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [selectedSort, setSelectedSort] = useState('name_asc');
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

  const records = useMemo(() => response?.data?.items || [], [response]);
  const stats = response?.data?.summary || DEFAULT_STATS;

  const filteredRecords = useMemo(() => {
    if (selectedFilter === 'ALL') return records;
    return records.filter(
      (record) => record.attendance_status?.toUpperCase() === selectedFilter.toUpperCase(),
    );
  }, [records, selectedFilter]);

  const sortedRecords = useMemo(() => {
    const data = [...filteredRecords];
    if (selectedSort === 'name_asc') {
      data.sort((a, b) => (a.employee?.name || '').localeCompare(b.employee?.name || ''));
    } else if (selectedSort === 'name_desc') {
      data.sort((a, b) => (b.employee?.name || '').localeCompare(a.employee?.name || ''));
    } else if (selectedSort === 'code_asc') {
      data.sort((a, b) => (a.employee?.emp_code || '').localeCompare(b.employee?.emp_code || ''));
    }
    return data;
  }, [filteredRecords, selectedSort]);

  const excelExportData = records.map((record) => ({
    Employee: record.employee?.name || '-',
    'Employee Code': record.employee?.emp_code || '-',
    Department: record.employee?.department || '-',
    Date: record.date || '-',
    'Check-in': record.check_in || '-',
    'Check-out': record.check_out || '-',
    'Worked Hours': record.worked_hours || '-',
    Status: formatStatus(record.attendance_status),
    Notes: record.notes || '-',
  }));

  return (
    <div className={styles.container}>
      <PageHeader
        title="Daily Preview"
        subtitle="View daily attendance status of employees."
        actions={
          <DatePicker
            value={currentDate}
            onChange={(date) => {
              setCurrentDate(date);
              setPage(1);
            }}
            className={styles.customDatePicker}
          />
        }
      />

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Present</span>
            <span className={styles.statValue}>{stats.present}</span>
          </div>
          <CalendarCheck className={styles.statIcon} size={24} />
        </div>
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Absent</span>
            <span className={styles.statValue}>{stats.absent}</span>
          </div>
          <CalendarX className={styles.statIcon} size={24} />
        </div>
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Late Arrivals</span>
            <span className={styles.statValue}>{stats.late}</span>
          </div>
          <Clock className={styles.statIcon} size={24} />
        </div>
        <div className={styles.statCard}>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Half-Day</span>
            <span className={styles.statValue}>{stats.half_day}</span>
          </div>
          <Hourglass className={styles.statIcon} size={24} />
        </div>
      </div>

      <section className={styles.tableSection}>
        <div className={styles.tableHeader}>
          <div className={styles.titleRow}>
            <div className={styles.tableTitleContainer}>
              <div className={styles.tableTitleWrapper}>
                <h2>Employee Attendance</h2>
                <span className={styles.entriesBadge}>
                  {response?.data?.pagination?.total || 0} Entries
                </span>
              </div>
              <p className={styles.tableSubtitle}>Time and presence management</p>
            </div>
            <div className={styles.actionButtons}>
              <ExcelExport
                data={excelExportData}
                filename={`attendance_${currentDate}.xlsx`}
                sheetName="Attendance"
                buttonText="Export"
                variant="secondary"
              />
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                <Plus size={16} />
                Add manual entry
              </Button>
            </div>
          </div>

          <ListControls
            className={styles.listControls}
            searchPlaceholder="Search employee name or ID..."
            searchQuery={searchTerm}
            onSearchChange={(value) => {
              setSearchTerm(value);
              setPage(1);
            }}
            showFilters={true}
            filterOptions={FILTER_OPTIONS}
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
            filterTitle="Filters"
            showSort={true}
            sortOptions={SORT_OPTIONS}
            selectedSort={selectedSort}
            onSortChange={setSelectedSort}
            showViewSwitcher={false}
          />
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
              ) : sortedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '48px 24px' }}>
                    <NoDataFound
                      title="No Records Found"
                      description="There are no attendance records for the selected date."
                    />
                  </td>
                </tr>
              ) : (
                sortedRecords.map((record) => (
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
            Page {page} of {Math.ceil((response?.data?.pagination?.total || 0) / 20) || 1}
          </span>
          <div className={styles.pageActions}>
            <button
              className={styles.pagiBtnText}
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <button
              className={styles.pagiBtnText}
              disabled={!response?.data?.pagination || page * 20 >= response.data.pagination.total}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>

      <AddManualEntryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default DailyPreviewPage;
