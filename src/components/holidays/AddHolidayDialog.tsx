import React, { useState } from 'react';

import { Dialog } from '../common/Dialog/Dialog';
import { Button } from '../common/Button/Button';
import { Input } from '../ui/Input/Input';
import { Select } from '../ui/Select/Select';
import { DatePicker } from '../ui/DatePicker/DatePicker';
import { useAddHoliday } from '../../hooks/useHolidays';

import styles from './AddHolidayDialog.module.scss';

interface AddHolidayDialogProps {
  open: boolean;
  onClose: () => void;
  calendarId: string;
}

const CATEGORY_COLORS = [
  '#FFC107', // Yellow
  '#4ADE80', // Green
  '#60A5FA', // Blue
  '#F87171', // Red
  '#A78BFA', // Purple
];

export const AddHolidayDialog: React.FC<AddHolidayDialogProps> = ({
  open,
  onClose,
  calendarId,
}) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState<'PUBLIC' | 'OPTIONAL' | 'COMPANY'>('PUBLIC');
  const [color, setColor] = useState(CATEGORY_COLORS[0]);
  const [description, setDescription] = useState('');

  const addHolidayMutation = useAddHoliday(calendarId, {
    onSuccess: () => {
      onClose();
      // Reset form
      setName('');
      setDate('');
      setType('PUBLIC');
      setColor(CATEGORY_COLORS[0]);
      setDescription('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addHolidayMutation.mutate({
      name,
      date,
      type,
      color,
      description,
    });
  };

  return (
    <Dialog
      title="Add Holiday"
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
            isLoading={addHolidayMutation.isPending}
            disabled={!name || !date}
          >
            Save Holiday
          </Button>
        </div>
      }
    >
      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          label="Holiday Name"
          placeholder="e.g. Christmas Day"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <DatePicker label="Select Date" value={date} onChange={setDate} required inline />
        <Select
          label="Holiday Type"
          options={[
            { value: 'PUBLIC', label: 'Public Holiday' },
            { value: 'OPTIONAL', label: 'Optional Holiday' },
            { value: 'COMPANY', label: 'Company Holiday' },
          ]}
          value={type}
          onChange={(e) => setType(e.target.value as 'PUBLIC' | 'OPTIONAL' | 'COMPANY')}
          required
        />
        <div className={styles.categorySection}>
          <label className={styles.label}>Category Colour</label>
          <div className={styles.colorPresets}>
            {CATEGORY_COLORS.map((c) => (
              <div
                key={c}
                className={`${styles.colorDot} ${color === c ? styles.selected : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>
      </form>
    </Dialog>
  );
};
