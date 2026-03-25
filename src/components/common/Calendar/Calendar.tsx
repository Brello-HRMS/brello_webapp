import { type ComponentType } from 'react';
import {
  Calendar as RBCCalendar,
  dateFnsLocalizer,
  type CalendarProps as RBCCalendarProps,
  type ToolbarProps,
} from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import styles from './Calendar.module.scss';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales,
});

const CustomToolbar = <TEvent extends object, TResource extends object>(
  toolbar: ToolbarProps<TEvent, TResource>,
) => {
  const goToBack = () => {
    toolbar.onNavigate('PREV');
  };

  const goToNext = () => {
    toolbar.onNavigate('NEXT');
  };

  const label = () => {
    const { date, view } = toolbar;
    let startDate = date;
    let endDate = date;

    if (view === 'month') {
      startDate = startOfMonth(date);
      endDate = endOfMonth(date);
    } else if (view === 'week') {
      startDate = startOfWeek(date);
      endDate = toolbar.label.split(' – ')[1] ? new Date(toolbar.label.split(' – ')[1]) : date;
    }

    return (
      <div className={styles.titleSection}>
        <p className={styles.monthYear}>{format(date, 'MMMM - yyyy')}</p>
        <p className={styles.dateRange}>
          {format(startDate, 'MMM dd, yyyy')} - {format(endDate, 'MMM dd, yyyy')}
        </p>
      </div>
    );
  };

  return (
    <div className={styles.toolbar}>
      <div className={styles.leftSection}>
        <div className={styles.dateBlock}>
          <div className={styles.monthLabel}>{format(new Date(), 'MMM')}</div>
          <div className={styles.dayLabel}>{format(new Date(), 'dd')}</div>
        </div>
        {label()}
      </div>

      <div className={styles.rightSection}>
        <div className={styles.controlsGroup}>
          <button onClick={goToBack} type="button" className={styles.navButton}>
            <ChevronLeft size={18} />
          </button>

          <button className={styles.monthSelector} type="button">
            <CalendarIcon size={16} />
            <span>{format(toolbar.date, 'MMMM')}</span>
          </button>

          <button onClick={goToNext} type="button" className={styles.navButton}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export interface CalendarProps<TEvent extends object = object> extends Omit<
  RBCCalendarProps<TEvent>,
  'localizer'
> {
  containerClassName?: string;
}

export function Calendar<TEvent extends object = object>({
  containerClassName = '',
  components,
  ...props
}: CalendarProps<TEvent>) {
  return (
    <div className={`${styles.calendarWrapper} ${containerClassName}`.trim()}>
      <RBCCalendar<TEvent>
        localizer={localizer}
        components={{
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          toolbar: CustomToolbar as ComponentType<ToolbarProps<any, any>>,
          ...components,
        }}
        {...props}
      />
    </div>
  );
}
