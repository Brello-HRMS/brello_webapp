import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import styles from '../TimesheetPage.module.scss';

import type { ProjectData, TimesheetEntryData } from './ProjectHoursTable';

const localizer = momentLocalizer(moment);

interface TimesheetCalendarProps {
  entries: TimesheetEntryData[];
  projects: ProjectData[];
  currentDate: Date;
  onNavigate: (date: Date) => void;
  view: 'month' | 'week' | 'day';
  onViewChange: (view: 'month' | 'week' | 'day') => void;
  onSelectEvent: (entry: TimesheetEntryData) => void;
  onSelectSlot: (slotInfo: { start: Date; end: Date }) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  resource: TimesheetEntryData;
}

interface ProjectCardProps {
  entry: TimesheetEntryData;
  projects: ProjectData[];
  onSelect: (entry: TimesheetEntryData) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ entry, projects, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const project = projects.find((p) => p.id === entry.projectId);
  const color = project?.color || '#8300ff';

  const abbreviation = (() => {
    if (!entry.projectName) return 'PRJ';
    const words = entry.projectName.split(' ');
    if (words.length > 1) {
      return words
        .map((w) => w[0])
        .join('')
        .substring(0, 4)
        .toUpperCase();
    }
    return entry.projectName.substring(0, 3).toUpperCase();
  })();

  const formattedTime = `${moment(entry.startTime, 'HH:mm').format('hh:mm A')} - ${moment(
    entry.endTime,
    'HH:mm',
  ).format('hh:mm A')}`;

  const handleMouseEnter = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top - 6,
        left: Math.max(8, Math.min(rect.left, window.innerWidth - 260 - 16)),
      });
    }
    setIsHovered(true);
  };

  return (
    <div
      ref={cardRef}
      className={styles.compactProjectCard}
      style={{ borderColor: color, color, backgroundColor: `${color}10` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(entry);
      }}
    >
      <span>{abbreviation}</span>

      {isHovered &&
        createPortal(
          <div
            className={styles.eventPopoverCard}
            style={{
              borderLeftColor: color,
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              transform: 'translateY(-100%)',
              pointerEvents: 'none',
            }}
          >
            <div className={styles.popoverField}>
              <span className={styles.popoverLabel}>Project:</span>
              <span className={styles.popoverValue} style={{ color }}>
                {entry.projectName}
              </span>
            </div>
            <div className={styles.popoverField}>
              <span className={styles.popoverLabel}>Hours:</span>
              <span className={styles.popoverValue}>{entry.hours}h</span>
            </div>
            <div className={styles.popoverField}>
              <span className={styles.popoverLabel}>Time:</span>
              <span className={styles.popoverValue}>{formattedTime}</span>
            </div>
            <div className={styles.popoverField}>
              <span className={styles.popoverLabel}>Task:</span>
              <span className={styles.popoverValue}>{entry.description}</span>
            </div>
            {entry.notes && (
              <div className={styles.popoverField}>
                <span className={styles.popoverLabel}>Notes:</span>
                <span className={styles.popoverValue}>{entry.notes}</span>
              </div>
            )}
            <div className={styles.popoverField}>
              <span className={styles.popoverLabel}>Status:</span>
              <span
                className={`${styles.popoverBadge} ${styles[entry.status.toLowerCase()] || ''}`}
              >
                {entry.status}
              </span>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

interface MoreIndicatorProps {
  entries: TimesheetEntryData[];
  projects: ProjectData[];
  onSelect: (entry: TimesheetEntryData) => void;
}

const MoreIndicator: React.FC<MoreIndicatorProps> = ({ entries, projects, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const showList = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top - 6,
        left: Math.max(8, Math.min(rect.left, window.innerWidth - 280 - 16)),
      });
    }
    setIsHovered(true);
  };

  const hideList = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150);
  };

  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={styles.moreIndicatorCard}
      onMouseEnter={showList}
      onMouseLeave={hideList}
      onClick={(e) => e.stopPropagation()}
    >
      <span>+{entries.length}</span>

      {isHovered &&
        createPortal(
          <div
            className={styles.morePopoverList}
            style={{
              position: 'fixed',
              top: coords.top,
              left: coords.left,
              transform: 'translateY(-100%)',
            }}
            onMouseEnter={showList}
            onMouseLeave={hideList}
          >
            <div className={styles.morePopoverHeader}>
              Remaining Logged Entries (+{entries.length})
            </div>
            <div className={styles.morePopoverBody}>
              {entries.map((entry) => {
                const project = projects.find((p) => p.id === entry.projectId);
                const color = project?.color || '#8300ff';
                const formattedTime = `${moment(entry.startTime, 'HH:mm').format(
                  'hh:mm A',
                )} - ${moment(entry.endTime, 'HH:mm').format('hh:mm A')}`;

                return (
                  <div
                    key={entry.id}
                    className={styles.morePopoverItem}
                    style={{ borderLeftColor: color }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(entry);
                      setIsHovered(false);
                    }}
                  >
                    <div className={styles.morePopoverItemHeader}>
                      <strong style={{ color }}>{entry.projectName}</strong>
                      <span>
                        {entry.hours}h ({formattedTime})
                      </span>
                    </div>
                    <div className={styles.morePopoverItemDesc}>{entry.description}</div>
                  </div>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export const TimesheetCalendar: React.FC<TimesheetCalendarProps> = ({
  entries,
  projects,
  currentDate,
  onNavigate,
  view,
  onViewChange,
  onSelectEvent,
  onSelectSlot,
}) => {
  // Map timesheet entries into react-big-calendar events
  const events = React.useMemo<CalendarEvent[]>(() => {
    return entries.map((entry) => {
      const [startH, startM] = entry.startTime.split(':').map(Number);
      const [endH, endM] = entry.endTime.split(':').map(Number);

      const startDate = moment(entry.date).hour(startH).minute(startM).toDate();
      let endDate = moment(entry.date).hour(endH).minute(endM).toDate();

      if (endDate < startDate) {
        // Night shift crossing midnight
        endDate = moment(entry.date).add(1, 'day').hour(endH).minute(endM).toDate();
      }

      return {
        id: entry.id,
        title: `${entry.projectName}: ${entry.hours}h`,
        start: startDate,
        end: endDate,
        allDay: false,
        resource: entry,
      };
    });
  }, [entries]);

  // Custom Toolbar Component
  const CustomToolbar = (toolbarProps: {
    date: Date;
    view: 'month' | 'week' | 'day';
    onNavigate: (action: NavigateAction) => void;
    onView: (view: 'month' | 'week' | 'day') => void;
  }) => {
    const {
      date,
      view: activeView,
      onNavigate: navigateCalendar,
      onView: changeView,
    } = toolbarProps;

    const handlePrev = () => navigateCalendar('PREV');
    const handleNext = () => navigateCalendar('NEXT');
    const handleToday = () => navigateCalendar('TODAY');

    const getLabel = () => {
      const mDate = moment(date);
      if (activeView === 'month') {
        return mDate.format('MMMM YYYY');
      } else if (activeView === 'week') {
        const start = mDate.clone().startOf('isoWeek').format('MMM DD');
        const end = mDate.clone().endOf('isoWeek').format('MMM DD, YYYY');
        return `${start} - ${end}`;
      } else {
        return mDate.format('dddd, MMM DD, YYYY');
      }
    };

    return (
      <div className={styles.customToolbar}>
        <div className={styles.toolbarLeft}>
          <span className={styles.toolbarLabel}>{getLabel()}</span>
        </div>
        <div className={styles.toolbarCenter}>
          <button
            type="button"
            className={styles.navBtn}
            onClick={handlePrev}
            aria-label="Previous"
          >
            <ChevronLeft size={16} />
          </button>
          <button type="button" className={styles.todayBtn} onClick={handleToday}>
            Today
          </button>
          <button type="button" className={styles.navBtn} onClick={handleNext} aria-label="Next">
            <ChevronRight size={16} />
          </button>
        </div>
        <div className={styles.toolbarRight}>
          <div className={styles.viewToggleGroup}>
            {(['month', 'week', 'day'] as const).map((v) => (
              <button
                key={v}
                type="button"
                className={`${styles.viewToggleBtn} ${activeView === v ? styles.active : ''}`}
                onClick={() => {
                  changeView(v);
                  onViewChange(v);
                }}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Custom Event component to render nice details
  const CustomEventComponent = ({ event }: { event: CalendarEvent }) => {
    const entry = event.resource;
    const project = projects.find((p) => p.id === entry.projectId);
    const color = project?.color || '#8300ff';

    return (
      <div className={styles.eventContentWrapper}>
        <div className={styles.eventHeader}>
          <span className={styles.eventColorDot} style={{ backgroundColor: color }} />
          <strong className={styles.eventTitleText}>{entry.projectName}</strong>
        </div>
        <div className={styles.eventTimeText}>
          {entry.startTime} - {entry.endTime} ({entry.hours} hrs)
        </div>
        {view !== 'month' && <div className={styles.eventDescText}>{entry.description}</div>}
      </div>
    );
  };

  // Custom Date cell header for Month View
  const CustomDateHeader = ({ label, date: cellDate }: { label: string; date: Date }) => {
    const isToday = moment(cellDate).isSame(moment(), 'day');
    const dayEntries = useMemo(() => {
      const dateStr = moment(cellDate).format('YYYY-MM-DD');
      return entries.filter((e) => e.date === dateStr);
    }, [cellDate]);

    return (
      <div className={styles.dateHeaderContainer}>
        <div className={styles.projectCardsRow}>
          {dayEntries.slice(0, 3).map((entry) => (
            <ProjectCard
              key={entry.id}
              entry={entry}
              projects={projects}
              onSelect={onSelectEvent}
            />
          ))}
          {dayEntries.length > 3 && (
            <MoreIndicator
              entries={dayEntries.slice(3)}
              projects={projects}
              onSelect={onSelectEvent}
            />
          )}
        </div>
        <div className={`${styles.calendarDateHeader} ${isToday ? styles.isToday : ''}`}>
          {label}
        </div>
      </div>
    );
  };

  // Dynamic Event Styles
  const eventPropGetter = (event: CalendarEvent) => {
    const project = projects.find((p) => p.id === event.resource.projectId);
    const color = project?.color || '#8300ff';

    return {
      style: {
        backgroundColor: `${color}12`,
        border: 'none',
        borderLeft: `4px solid ${color}`,
        borderRadius: '6px',
        color: 'var(--color-text-primary-500)',
        fontSize: '11px',
        fontWeight: '500',
        padding: '4px 6px',
        height: '100%',
        minHeight: '28px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
      },
    };
  };

  return (
    <div className={styles.calendarCard}>
      <Calendar<CalendarEvent>
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        date={currentDate}
        onNavigate={(newDate) => onNavigate(newDate)}
        view={view}
        onView={(v: string) => onViewChange(v as 'month' | 'week' | 'day')}
        views={['month', 'week', 'day']}
        onSelectEvent={(event) => onSelectEvent(event.resource)}
        onSelectSlot={(slotInfo) => onSelectSlot({ start: slotInfo.start, end: slotInfo.end })}
        selectable={true}
        eventPropGetter={eventPropGetter}
        components={{
          toolbar: CustomToolbar,
          event: CustomEventComponent,
          month: {
            dateHeader: CustomDateHeader,
          },
        }}
        style={{ height: 'calc(100vh - 280px)', minHeight: '550px' }}
      />
    </div>
  );
};
