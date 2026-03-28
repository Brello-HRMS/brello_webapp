import React, { useState } from 'react';

import { Dialog } from '../common/Dialog/Dialog';
import { Button } from '../common/Button/Button';
import { Input } from '../ui/Input/Input';
import { Select } from '../ui/Select/Select';
import { ToggleButton } from '../common/ToggleButton/ToggleButton';
import { useCreateCalendar } from '../../hooks/useHolidays';

import styles from './AddCalendarDialog.module.scss';

interface AddCalendarDialogProps {
  open: boolean;
  onClose: () => void;
}

export const AddCalendarDialog: React.FC<AddCalendarDialogProps> = ({ open, onClose }) => {
  const [name, setName] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [isActive, setIsActive] = useState(true);
  const [copyPrevious, setCopyPrevious] = useState(false);

  const createCalendarMutation = useCreateCalendar({
    onSuccess: () => {
      onClose();
      setName('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCalendarMutation.mutate({
      name,
      year: parseInt(year),
    });
  };

  const yearOptions = Array.from({ length: 10 }, (_, i) => {
    const y = new Date().getFullYear() + i;
    return { value: y.toString(), label: y.toString() };
  });

  return (
    <Dialog
      title="Add New Calendar"
      open={open}
      onClose={onClose}
      maxWidth="450px"
      position="right"
      actions={
        <div className={styles.actions}>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={createCalendarMutation.isPending}
            disabled={!name}
          >
            Create calendar
          </Button>
        </div>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          label="Calendar Name"
          placeholder="e.g. India - 2026"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Select
          label="Year"
          options={yearOptions}
          value={year}
          onChange={(e) => setYear(e.target.value)}
          required
        />
        <div className={styles.toggleRow}>
          <div className={styles.toggleInfo}>
            <span className={styles.toggleLabel}>Status</span>
            <span className={styles.toggleDescription}>Set the initial visibility state</span>
          </div>
          <div className={styles.statusBadge}>
            <span className={isActive ? styles.activeText : styles.inactiveText}>
              {isActive ? 'ACTIVE' : 'INACTIVE'}
            </span>
            <ToggleButton checked={isActive} onChange={setIsActive} />
          </div>
        </div>
        <div className={styles.toggleRow}>
          <div className={styles.toggleInfo}>
            <span className={styles.toggleLabel}>Clone from previous year</span>
            <span className={styles.toggleDescription}>
              Automatically copy holidays and regional savings from the {parseInt(year) - 1}{' '}
              calendar.
            </span>
          </div>
          <ToggleButton checked={copyPrevious} onChange={setCopyPrevious} />
        </div>
      </form>
    </Dialog>
  );
};
