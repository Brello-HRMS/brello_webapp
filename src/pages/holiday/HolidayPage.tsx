import React, { useState } from 'react';

import { Calendar, PageHeader } from '../../components/common';
import { useHolidays } from '../../hooks/useHolidays';

import styles from './HolidayPage.module.scss';

import type { HolidayEvent } from '../../services/holidayService';

const HolidayPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: holidays = [], isLoading, isError } = useHolidays(currentDate.getFullYear());

  const eventStyleGetter = (event: HolidayEvent) => {
    let className = styles.event_default;
    if (event.type === 'holiday') className = styles.event_holiday;
    if (event.type === 'republic') className = styles.event_republic;

    return {
      className,
    };
  };

  return (
    <div>
      <PageHeader
        title="Public Holidays"
        subtitle={`View all public and company holidays for the year ${currentDate.getFullYear()}.`}
      />
      <div className={styles.calendarContainer}>
        {isLoading ? (
          <div className={styles.loadingContainer}>Loading holidays...</div>
        ) : isError ? (
          <div className={styles.errorContainer}>
            Error loading holidays. Please check your API key.
          </div>
        ) : (
          <Calendar<HolidayEvent>
            events={holidays}
            date={currentDate}
            onNavigate={(date) => setCurrentDate(date)}
            defaultView="month"
            eventPropGetter={eventStyleGetter}
          />
        )}
      </div>
    </div>
  );
};

export default HolidayPage;
