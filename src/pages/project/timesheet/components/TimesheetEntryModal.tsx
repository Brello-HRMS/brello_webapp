import React, { useState, useEffect } from 'react';
import moment from 'moment';

import { Dialog, Button } from '../../../../components/common';
import { Input } from '../../../../components/ui/Input/Input';
import { Select } from '../../../../components/ui/Select/Select';
import { DatePicker } from '../../../../components/ui/DatePicker/DatePicker';
import { TimePicker } from '../../../../components/common/TimePicker/TimePicker';
import { TextArea } from '../../../../components/ui/TextArea/TextArea';
import styles from '../TimesheetPage.module.scss';

import type { ProjectData, TimesheetEntryData } from './ProjectHoursTable';

interface TimesheetEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    entry: Omit<TimesheetEntryData, 'projectName' | 'hours' | 'status'> & {
      id?: string;
      notes?: string;
    },
  ) => void;
  onDelete?: (id: string) => void;
  entry?: TimesheetEntryData | null;
  projects: ProjectData[];
  preselectedSlot?: { date: string; startTime: string; endTime: string } | null;
}

export const TimesheetEntryModal: React.FC<TimesheetEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  entry,
  projects,
  preselectedSlot,
}) => {
  const [projectId, setProjectId] = useState('');
  const [date, setDate] = useState(() => moment().format('YYYY-MM-DD'));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (entry) {
      setProjectId(entry.projectId);
      setDate(entry.date);
      setStartTime(entry.startTime);
      setEndTime(entry.endTime);
      setDescription(entry.description);
      setNotes(entry.notes || '');
      setErrors({});
    } else if (preselectedSlot) {
      setProjectId(projects[0]?.id || '');
      setDate(preselectedSlot.date);
      setStartTime(preselectedSlot.startTime);
      setEndTime(preselectedSlot.endTime);
      setDescription('');
      setNotes('');
      setErrors({});
    } else {
      setProjectId(projects[0]?.id || '');
      setDate(moment().format('YYYY-MM-DD'));
      setStartTime('09:00');
      setEndTime('17:00');
      setDescription('');
      setNotes('');
      setErrors({});
    }
  }, [entry, isOpen, projects, preselectedSlot]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Recalculate hours dynamically on render
  const totalHours = React.useMemo(() => {
    if (!startTime || !endTime) return 0;

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    let endMinutes = endH * 60 + endM;

    if (endMinutes < startMinutes) {
      // Allow night shift spanning across midnight
      endMinutes += 24 * 60;
    }

    return (endMinutes - startMinutes) / 60;
  }, [startTime, endTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors: Record<string, string> = {};
    if (!projectId) {
      validationErrors.project = 'Project is required.';
    }
    if (!date) {
      validationErrors.date = 'Date is required.';
    }
    if (!startTime) {
      validationErrors.startTime = 'Start time is required.';
    }
    if (!endTime) {
      validationErrors.endTime = 'End time is required.';
    }
    if (!description.trim()) {
      validationErrors.description = 'Work description is required.';
    }
    if (startTime === endTime) {
      validationErrors.endTime = 'Start and end time cannot be identical.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSave({
      id: entry?.id,
      projectId,
      date,
      startTime,
      endTime,
      description: description.trim(),
      notes: notes.trim() || undefined,
    });
  };

  const projectOptions = projects.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  const actions = (
    <>
      {entry && onDelete && (
        <Button
          type="button"
          variant="danger"
          onClick={() => onDelete(entry.id)}
          style={{ marginRight: 'auto' }}
        >
          Delete Log
        </Button>
      )}
      <Button type="button" variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button type="submit" variant="primary" form="timesheet-form">
        {entry ? 'Update Log' : 'Save Log'}
      </Button>
    </>
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={entry ? 'Edit Timesheet Entry' : 'Add Timesheet Entry'}
      maxWidth="500px"
      position="right"
      actions={actions}
    >
      <form id="timesheet-form" onSubmit={handleSubmit} className={styles.modalForm}>
        {/* Employee - Read-only */}
        <div className={styles.formRow}>
          <Input
            label="Employee"
            value="Jane Doe (You)"
            disabled
            className={styles.readOnlyInput}
          />
        </div>

        {/* Project Select */}
        <div className={styles.formRow}>
          <Select
            label="Project *"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            options={projectOptions}
            placeholder="Select project"
            error={errors.project}
          />
        </div>

        {/* Date Picker */}
        <div className={styles.formRow}>
          <DatePicker
            label="Date"
            required
            value={date}
            onChange={(newDate) => setDate(newDate)}
            error={errors.date}
          />
        </div>

        {/* Start and End Time Pickers */}
        <div className={styles.formTimeRow}>
          <div className={styles.timePickerCol}>
            <TimePicker
              label="Start Time *"
              value={startTime}
              onChange={(time) => setStartTime(time)}
              error={errors.startTime}
            />
          </div>
          <div className={styles.timePickerCol}>
            <TimePicker
              label="End Time *"
              value={endTime}
              onChange={(time) => setEndTime(time)}
              error={errors.endTime}
            />
          </div>
        </div>

        {/* Auto-calculated Total Hours - Read-only */}
        <div className={styles.formRow}>
          <Input
            label="Total Hours (Auto-calculated)"
            value={totalHours % 1 === 0 ? `${totalHours} hrs` : `${totalHours.toFixed(2)} hrs`}
            disabled
            className={styles.readOnlyInput}
          />
        </div>

        {/* Task Description */}
        <div className={styles.formRow}>
          <TextArea
            label="Task Description / Work Done *"
            placeholder="Please describe the tasks completed..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            error={errors.description}
          />
        </div>

        {/* Notes (Optional) */}
        <div className={styles.formRow}>
          <Input
            label="Notes (Optional)"
            placeholder="Any additional notes or comments..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </form>
    </Dialog>
  );
};
