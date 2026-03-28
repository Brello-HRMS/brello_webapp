import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  Calendar as CalendarIcon,
  List,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Calendar, momentLocalizer, type NavigateAction } from 'react-big-calendar';
import moment from 'moment';

import { Button } from '../../components/common/Button/Button';
import { PageHeader } from '../../components/common/PageHeader/PageHeader';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useCalendarHolidays, useCalendars, useDeleteCalendar } from '../../hooks/useHolidays';
import { AddHolidayDialog } from '../../components/holidays/AddHolidayDialog';
import { DataTable } from '../../components/common/DataTable/DataTable';

import styles from './HolidayCalendarView.module.scss';

import type { Holiday } from '../../types/holiday';

const localizer = momentLocalizer(moment);

const HolidayCalendarView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const currentYear = currentDate.getFullYear();
  const { data: calendarsResponse } = useCalendars(currentYear);
  const calendar = calendarsResponse?.data.find((c) => c.id === id);
  const deleteCalendarMutation = useDeleteCalendar();

  const { data: holidays, isLoading } = useCalendarHolidays(
    id || '',
    viewMode === 'calendar' ? currentDate.getMonth() + 1 : undefined,
  );

  const handleAddHoliday = () => {
    setIsAddModalOpen(true);
  };

  const handleCloneCalendar = () => {
    // TODO: Open modal
  };

  const handleDeleteCalendar = () => {
    if (window.confirm('Are you sure you want to delete this calendar?')) {
      deleteCalendarMutation.mutate(id!, {
        onSuccess: () => navigate('/attendance/holidays'),
      });
    }
  };

  const events = (holidays || []).map((h: Holiday) => ({
    id: h.id,
    title: h.name,
    start: new Date(h.date),
    end: new Date(h.date),
    allDay: true,
    resource: h,
  }));

  const columns = [
    {
      header: 'Date',
      accessorKey: 'date',
      cell: (info: { getValue: () => unknown }) =>
        moment(info.getValue() as string).format('DD MMM, YYYY'),
    },

    { header: 'Holiday Name', accessorKey: 'name' },
    { header: 'Type', accessorKey: 'type' },
    { header: 'Description', accessorKey: 'description' },
  ];

  const CustomToolbar = (toolbar: { date: Date; onNavigate: (action: NavigateAction) => void }) => {
    const goToBack = () => {
      toolbar.onNavigate('PREV');
    };
    const goToNext = () => {
      toolbar.onNavigate('NEXT');
    };
    const goToCurrent = () => {
      toolbar.onNavigate('TODAY');
    };

    const label = () => {
      const date = moment(toolbar.date);
      return (
        <div className={styles.toolbarTitleGroup}>
          <div className={styles.todayBadge}>
            <div className={styles.todayMonth}>{moment().format('MMM').toUpperCase()}</div>
            <div className={styles.todayDay}>{moment().format('DD')}</div>
          </div>
          <div className={styles.toolbarLabel}>
            <span className={styles.monthName}>
              {date.format('MMMM')} - {date.format('YYYY')}
            </span>
            <span className={styles.dateRange}>
              {date.startOf('month').format('MMM DD, YYYY')} -{' '}
              {date.endOf('month').format('MMM DD, YYYY')}
            </span>
          </div>
        </div>
      );
    };

    return (
      <div className={styles.customToolbar}>
        {label()}
        <div className={styles.toolbarActions}>
          <button className={styles.navBtn} onClick={goToBack}>
            <ChevronLeft size={20} />
          </button>
          <div className={styles.currentMonthBtn} onClick={goToCurrent}>
            <CalendarIcon size={18} />
            <span>{moment(toolbar.date).format('MMMM')}</span>
          </div>
          <button className={styles.navBtn} onClick={goToNext}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  };

  const CustomDateHeader = ({ label, date }: { label: string; date: Date }) => {
    const isToday = moment(date).isSame(moment(), 'day');
    return <div className={`${styles.dateHeader} ${isToday ? styles.isToday : ''}`}>{label}</div>;
  };

  const HolidayEvent = ({ event }: { event: { title: string } }) => {
    const holidayIcons: Record<string, string> = {
      'Republic Day': '🏛️',
      'Independence Day': '🇮🇳',
      'New Year': '🎉',
      Christmas: '🎄',
      Diwali: '🪔',
      Eid: '🌙',
    };
    const icon = holidayIcons[event.title] || '';

    return (
      <div className={styles.eventContent}>
        <span>{event.title}</span>
        {icon && <span>{icon}</span>}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <PageHeader
        title={calendar?.name || 'Loading...'}
        subtitle={calendar ? `${holidays?.length || 0} Holidays scheduled` : ''}
        actions={
          <div className={styles.actions}>
            <div className={styles.viewToggle}>
              <button
                className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.active : ''}`}
                onClick={() => setViewMode('list')}
              >
                <List size={18} />
              </button>
              <button
                className={`${styles.toggleBtn} ${viewMode === 'calendar' ? styles.active : ''}`}
                onClick={() => setViewMode('calendar')}
              >
                <CalendarIcon size={18} />
              </button>
            </div>
            <Button onClick={handleCloneCalendar} variant="secondary">
              <div className={styles.btnContent}>
                <Copy size={18} />
                <span>Clone Calendar</span>
              </div>
            </Button>
            <Button onClick={handleDeleteCalendar} variant="danger">
              <div className={styles.btnContent}>
                <Trash2 size={18} />
                <span>Delete Calendar</span>
              </div>
            </Button>
            <Button onClick={handleAddHoliday} variant="primary">
              <div className={styles.btnContent}>
                <Plus size={18} />
                <span>Add Holiday</span>
              </div>
            </Button>
          </div>
        }
      />

      <div className={styles.content}>
        {isLoading ? (
          <div className={styles.loading}>Loading...</div>
        ) : viewMode === 'calendar' ? (
          <div className={styles.calendarContainer}>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              date={currentDate}
              onNavigate={(date) => setCurrentDate(date)}
              components={{
                toolbar: CustomToolbar,
                event: HolidayEvent,
                month: {
                  dateHeader: CustomDateHeader,
                },
              }}
              style={{ height: 'calc(100vh - 280px)' }}
              eventPropGetter={(event: { resource?: Holiday }) => {
                const color = event.resource?.color || '#6366f1';
                return {
                  style: {
                    backgroundColor: `${color}15`,
                    border: 'none',
                    borderLeft: `6px solid ${color}`,
                    borderRadius: '4px',
                    color: '#1e293b',
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '4px 10px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  },
                };
              }}
            />
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <DataTable data={holidays || []} columns={columns} />
          </div>
        )}
      </div>

      <AddHolidayDialog
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        calendarId={id || ''}
      />
    </div>
  );
};

export default HolidayCalendarView;
