import React, { useState } from 'react';
import { Plus } from 'lucide-react';

import { PageHeader } from '../../components/common/PageHeader/PageHeader';
import { Button } from '../../components/common/Button/Button';
import { NoDataFound } from '../../components/common/NoDataFound/NoDataFound';
import {
  useCalendars,
  useActivateCalendar,
  useDeleteCalendar,
} from '../../features/holidays/hooks/useHolidays';
import { HolidayCard } from '../../features/holidays/components/HolidayCard';
import { AddCalendarDialog } from '../../features/holidays/components/AddCalendarDialog';
import noCalendarFoundImage from '../../assets/svg/holiday/no_calendar_found.svg';

import styles from './HolidaysPage.module.scss';

import type { Calendar } from '../../features/holidays/types';

const HolidaysPage: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { data: calendarsResponse, isLoading } = useCalendars();
  const activateCalendarMutation = useActivateCalendar();
  const deleteCalendarMutation = useDeleteCalendar();

  const calendars = calendarsResponse?.data || [];

  const handleAddCalendar = () => {
    setIsAddModalOpen(true);
  };

  const handleEditCalendar = (_calendar: Calendar) => {
    // TODO: Implement Edit
  };

  const handleDeleteCalendar = (id: string) => {
    if (window.confirm('Are you sure you want to delete this calendar?')) {
      deleteCalendarMutation.mutate(id);
    }
  };

  const handleActivateCalendar = (id: string) => {
    activateCalendarMutation.mutate(id);
  };

  return (
    <div className={styles.container}>
      {calendars.length !== 0 && (
        <PageHeader
          title="Holidays"
          subtitle="Manage company holiday calendar"
          actions={
            <Button onClick={handleAddCalendar} variant="primary">
              <div className={styles.btnContent}>
                <Plus size={18} />
                <span>Add Holiday Calendar</span>
              </div>
            </Button>
          }
        />
      )}

      <div className={styles.content}>
        {isLoading ? (
          <div>Loading...</div>
        ) : calendars.length === 0 ? (
          <NoDataFound
            title="No Calendars Added Yet"
            description="Create your first calendar to manage holidays, events, and working days for your organization."
            buttonText="Add Holiday Calendar"
            onButtonClick={handleAddCalendar}
            noDataImage={noCalendarFoundImage}
            noDataImageAlt="No calendars"
          />
        ) : (
          <div className={styles.calendarList}>
            {calendars.map((calendar: Calendar) => (
              <HolidayCard
                key={calendar.id}
                calendar={calendar}
                onEdit={handleEditCalendar}
                onDelete={handleDeleteCalendar}
                onActivate={handleActivateCalendar}
              />
            ))}
          </div>
        )}
      </div>

      <AddCalendarDialog open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};

export default HolidaysPage;
