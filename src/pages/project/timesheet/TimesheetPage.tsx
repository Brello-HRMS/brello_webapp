import React, { useState, useMemo } from 'react';
import moment from 'moment';
import { Search, RotateCcw, Briefcase, Clock, Calendar as CalendarIcon } from 'lucide-react';

import { Input } from '../../../components/ui/Input/Input';
import { Select } from '../../../components/ui/Select/Select';
import { DatePicker } from '../../../components/ui/DatePicker/DatePicker';
import { Button } from '../../../components/common/Button/Button';
import { WarningModal } from '../../../components/common/WarningModal/WarningModal';
import { showToast } from '../../../features/ToastFeature/ShowToast';
import { useTimesheetDashboard } from '../../../features/project/hooks/useTimesheetDashboard';
import { useTimesheetProjects } from '../../../features/project/hooks/useTimesheetProjects';
import { useTimesheetCalendar } from '../../../features/project/hooks/useTimesheetCalendar';
import { useCreateTimesheet } from '../../../features/project/hooks/useCreateTimesheet';
import { useUpdateTimesheet } from '../../../features/project/hooks/useUpdateTimesheet';
import { useDeleteTimesheet } from '../../../features/project/hooks/useDeleteTimesheet';

import { TimesheetHeader } from './components/TimesheetHeader';
import { ProjectHoursTable } from './components/ProjectHoursTable';
import { TimesheetCalendar } from './components/TimesheetCalendar';
import { TimesheetEntryModal } from './components/TimesheetEntryModal';
import styles from './TimesheetPage.module.scss';

import type { TimesheetEntryData, ProjectData } from './components/ProjectHoursTable';

// Helper palette and generator for project colors
const PALETTE = ['#8300ff', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];
const getProjectColor = (projectId: string) => {
  let hash = 0;
  for (let i = 0; i < projectId.length; i++) {
    hash = projectId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTE.length;
  return PALETTE[index];
};

const parseHHMMToHours = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) + (m || 0) / 60;
};

export const TimesheetPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimesheetEntryData | null>(null);
  const [preselectedSlot, setPreselectedSlot] = useState<{
    date: string;
    startTime: string;
    endTime: string;
  } | null>(null);

  // Calendar State
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  // API Queries
  const { data: dashboardData, isLoading: isDashboardLoading } = useTimesheetDashboard();
  const { data: projectsData, isLoading: isProjectsLoading } = useTimesheetProjects();

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth() + 1;
  const { data: calendarResponse, isLoading: isCalendarLoading } = useTimesheetCalendar(
    year,
    month,
  );

  // API Mutations
  const { mutate: createTimesheet } = useCreateTimesheet();
  const { mutate: updateTimesheet } = useUpdateTimesheet();
  const { mutate: deleteTimesheet } = useDeleteTimesheet();

  // Map Projects
  const projects = useMemo<ProjectData[]>(() => {
    return (projectsData?.data || []).map((p) => ({
      id: p.project_id,
      name: p.project_name,
      color: getProjectColor(p.project_id),
    }));
  }, [projectsData]);

  // Map Calendar Entries to flat array
  const entries = useMemo<TimesheetEntryData[]>(() => {
    if (!calendarResponse?.data?.calendar) return [];
    return calendarResponse.data.calendar.flatMap((day) =>
      day.entries.map((entry) => ({
        id: entry.id,
        projectId: entry.project_id,
        projectName: entry.project_name,
        date: moment(day.date).format('YYYY-MM-DD'),
        startTime: entry.start_time,
        endTime: entry.end_time,
        hours: parseHHMMToHours(entry.worked_hours),
        description: entry.task_description,
        notes: entry.note || '',
        status: entry.submission_status,
      })),
    );
  }, [calendarResponse]);

  // Dynamically Filter Entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // 1. Search filter (matching description or project name)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchDesc = entry.description.toLowerCase().includes(query);
        const matchProj = entry.projectName.toLowerCase().includes(query);
        if (!matchDesc && !matchProj) return false;
      }

      // 2. Project filter
      if (projectFilter && entry.projectId !== projectFilter) {
        return false;
      }

      // 3. Date Range Filter
      if (startDateFilter && entry.date < startDateFilter) {
        return false;
      }
      if (endDateFilter && entry.date > endDateFilter) {
        return false;
      }

      return true;
    });
  }, [entries, searchQuery, projectFilter, startDateFilter, endDateFilter]);

  const handleAddClick = () => {
    setSelectedEntry(null);
    setPreselectedSlot(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (entry: TimesheetEntryData) => {
    setSelectedEntry(entry);
    setPreselectedSlot(null);
    setIsModalOpen(true);
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedEntry(null);
    setPreselectedSlot({
      date: moment(start).format('YYYY-MM-DD'),
      startTime: moment(start).format('HH:mm'),
      endTime: moment(end).format('HH:mm'),
    });
    setIsModalOpen(true);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setProjectFilter('');
    setStartDateFilter('');
    setEndDateFilter('');
    showToast('Filters cleared', 'success');
  };

  const handleSaveEntry = (
    formData: Omit<TimesheetEntryData, 'projectName' | 'hours' | 'status'> & {
      id?: string;
      notes?: string;
    },
  ) => {
    const payload = {
      project_id: formData.projectId,
      entry_date: formData.date,
      start_time: formData.startTime,
      end_time: formData.endTime,
      task_description: formData.description,
      note: formData.notes || undefined,
    };

    if (formData.id) {
      updateTimesheet(
        { id: formData.id, data: payload },
        {
          onSuccess: () => {
            setIsModalOpen(false);
          },
        },
      );
    } else {
      createTimesheet(payload, {
        onSuccess: () => {
          setIsModalOpen(false);
        },
      });
    }
  };

  const handleDeleteClick = (id: string) => {
    setEntryToDelete(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (entryToDelete) {
      deleteTimesheet(entryToDelete, {
        onSuccess: () => {
          setShowDeleteModal(false);
          setEntryToDelete(null);
          setIsModalOpen(false);
        },
      });
    }
  };

  if (isDashboardLoading || isProjectsLoading || isCalendarLoading) {
    return (
      <div
        className={styles.timesheetContainer}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          minHeight: '400px',
        }}
      >
        <span>Loading timesheets...</span>
      </div>
    );
  }

  return (
    <div className={styles.timesheetContainer}>
      <TimesheetHeader
        entries={entries}
        projects={projects}
        selectedProjectId={projectFilter || undefined}
        startDate={startDateFilter || undefined}
        endDate={endDateFilter || undefined}
        onAddClick={handleAddClick}
      />

      {/* Filter panel */}
      <div className={styles.filterBarContainer}>
        {/* Search */}
        <div className={styles.searchField}>
          <Input
            placeholder="Search description or projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search size={18} />}
          />
        </div>

        {/* Project Filter */}
        <div className={styles.filterField}>
          <Select
            label="Project Filter"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            options={[
              { value: '', label: 'All Projects' },
              ...projects.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
        </div>

        {/* Date Range Start */}
        <div className={styles.dateField}>
          <DatePicker
            label="From Date"
            value={startDateFilter}
            onChange={(date) => setStartDateFilter(date)}
          />
        </div>

        {/* Date Range End */}
        <div className={styles.dateField}>
          <DatePicker
            label="To Date"
            value={endDateFilter}
            onChange={(date) => setEndDateFilter(date)}
          />
        </div>

        {/* Reset Filter Button */}
        {(searchQuery || projectFilter || startDateFilter || endDateFilter) && (
          <Button variant="outline" className={styles.resetBtn} onClick={handleResetFilters}>
            <RotateCcw size={16} />
            <span>Reset</span>
          </Button>
        )}
      </div>

      {/* Summary Row - Horizontal Layout (Metrics left, breakdown right) */}
      <div className={styles.summaryRow}>
        <div className={styles.metricsCol}>
          {/* Total Projects Card */}
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <div className={`${styles.iconContainer} ${styles.purpleIcon}`}>
                <Briefcase size={20} />
              </div>
              <span className={styles.metricLabel}>Projects Assigned</span>
            </div>
            <div className={styles.metricValue}>{dashboardData?.data?.project_count ?? 0}</div>
            <span className={styles.metricSubtext}>Across all clients</span>
          </div>

          {/* Hours Week Card */}
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <div className={`${styles.iconContainer} ${styles.blueIcon}`}>
                <CalendarIcon size={20} />
              </div>
              <span className={styles.metricLabel}>Hours This Week</span>
            </div>
            <div className={styles.metricValue}>
              {dashboardData?.data?.hours_this_week !== undefined
                ? (() => {
                    const val = parseHHMMToHours(dashboardData.data.hours_this_week);
                    return val % 1 === 0 ? `${val}h` : `${val.toFixed(1)}h`;
                  })()
                : '0h'}
            </div>
            <span className={styles.metricSubtext}>Mon - Sun current week</span>
          </div>

          {/* Hours Month Card */}
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <div className={`${styles.iconContainer} ${styles.greenIcon}`}>
                <Clock size={20} />
              </div>
              <span className={styles.metricLabel}>Hours This Month</span>
            </div>
            <div className={styles.metricValue}>
              {dashboardData?.data?.hours_this_month !== undefined
                ? (() => {
                    const val = parseHHMMToHours(dashboardData.data.hours_this_month);
                    return val % 1 === 0 ? `${val}h` : `${val.toFixed(1)}h`;
                  })()
                : '0h'}
            </div>
            <span className={styles.metricSubtext}>Current calendar month</span>
          </div>
        </div>

        {/* Project Breakdown Table Column */}
        <div className={styles.breakdownCol}>
          <ProjectHoursTable projects={projects} entries={filteredEntries} />
        </div>
      </div>

      {/* Main Calendar View - Takes Full Available Width */}
      <TimesheetCalendar
        entries={filteredEntries}
        projects={projects}
        currentDate={calendarDate}
        onNavigate={setCalendarDate}
        view={calendarView}
        onViewChange={setCalendarView}
        onSelectEvent={handleEventClick}
        onSelectSlot={handleSelectSlot}
      />

      {/* Add / Edit Entry Modal */}
      <TimesheetEntryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEntry}
        onDelete={handleDeleteClick}
        entry={selectedEntry}
        projects={projects}
        preselectedSlot={preselectedSlot}
      />

      {/* Delete Confirmation Modal */}
      <WarningModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Timesheet Entry?"
        description="Are you sure you want to delete this timesheet entry? This action cannot be undone."
        actionLabel="Delete"
        onAction={handleConfirmDelete}
      />
    </div>
  );
};

export default TimesheetPage;
