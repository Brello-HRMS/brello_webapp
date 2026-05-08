import React, { useState } from 'react';

import { Dialog, Button, ToggleButton } from '../../../../components/common';
import { Input } from '../../../../components/ui/Input/Input';
import { useWeeklyOffs } from '../hooks/useWeeklyOffs';
import { Status, type ApiError } from '../../../../types/common';

import styles from './CreateWeeklyOffModal.module.scss';

import type { IWeeklyOff, ICreateWeeklyOffForm } from '../types/setupTypes';

interface CreateWeeklyOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: IWeeklyOff | null;
}

type SaturdayRule = 'ALL_WORKING' | 'ALL_OFF' | 'ODD_OFF' | 'EVEN_OFF' | 'CUSTOM';

const DAYS = [
  { id: 'Monday', label: 'M', full: 'Monday' },
  { id: 'Tuesday', label: 'T', full: 'Tuesday' },
  { id: 'Wednesday', label: 'W', full: 'Wednesday' },
  { id: 'Thursday', label: 'T', full: 'Thursday' },
  { id: 'Friday', label: 'F', full: 'Friday' },
  { id: 'Sunday', label: 'S', full: 'Sunday' },
];

const SATURDAY_OPTIONS: { value: SaturdayRule; label: string }[] = [
  { value: 'ALL_WORKING', label: 'All Working' },
  { value: 'ALL_OFF', label: 'All Off' },
  { value: 'ODD_OFF', label: '1st, 3rd & 5th Off' },
  { value: 'EVEN_OFF', label: '2nd & 4th Off' },
  { value: 'CUSTOM', label: 'Custom' },
];

const WEEK_LABELS = ['1st', '2nd', '3rd', '4th', '5th'];

const DEFAULT_WORKING_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const deriveSaturdayRule = (data?: IWeeklyOff | null): SaturdayRule => {
  if (data?.saturday_rule) return data.saturday_rule as SaturdayRule;
  if (data?.days?.some((d) => d.toUpperCase() === 'SATURDAY')) return 'ALL_OFF';
  return 'ALL_WORKING';
};

const getInitialWorkingDays = (data?: IWeeklyOff | null): string[] => {
  if (data) {
    const offDays = new Set((data.days ?? []).map((d) => d.charAt(0) + d.slice(1).toLowerCase()));
    return DAYS.map((d) => d.id).filter((d) => !offDays.has(d));
  }
  return DEFAULT_WORKING_DAYS;
};

const CreateWeeklyOffModal: React.FC<CreateWeeklyOffModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const [name, setName] = useState(initialData?.name ?? '');
  const [workingDays, setWorkingDays] = useState<string[]>(() =>
    getInitialWorkingDays(initialData),
  );
  const [saturdayRule, setSaturdayRule] = useState<SaturdayRule>(() =>
    deriveSaturdayRule(initialData),
  );
  const [saturdayOffWeeks, setSaturdayOffWeeks] = useState<number[]>(
    () => initialData?.saturday_off_weeks ?? [],
  );

  const {
    createWeeklyOff,
    isCreating,
    updateWeeklyOff,
    isUpdating,
    changeWeeklyOffStatus,
    isChangingStatus,
  } = useWeeklyOffs();
  const isEditing = !!initialData;
  const isSaving = isCreating || isUpdating || isChangingStatus;

  const [localStatus, setLocalStatus] = useState<string>(initialData?.status ?? Status.ACTIVE);
  const [statusError, setStatusError] = useState<string | null>(null);

  const toggleDay = (id: string) => {
    setWorkingDays((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  };

  const toggleSaturdayWeek = (week: number) => {
    setSaturdayOffWeeks((prev) =>
      prev.includes(week) ? prev.filter((w) => w !== week) : [...prev, week].sort((a, b) => a - b),
    );
  };

  const getSaturdayDayButtonClass = () => {
    if (saturdayRule === 'ALL_WORKING') return styles.selected;
    if (saturdayRule === 'ALL_OFF') return '';
    return styles.partial;
  };

  const handleSaturdayDayClick = () => {
    setSaturdayRule((prev) => (prev === 'ALL_WORKING' ? 'ALL_OFF' : 'ALL_WORKING'));
  };

  const getPreviewDescription = () => {
    const nonSatOff = DAYS.filter((d) => !workingDays.includes(d.id)).map((d) => d.full);

    let saturdayDesc = '';
    switch (saturdayRule) {
      case 'ALL_OFF':
        nonSatOff.push('Saturday');
        break;
      case 'ODD_OFF':
        saturdayDesc = '1st, 3rd & 5th Saturdays';
        break;
      case 'EVEN_OFF':
        saturdayDesc = '2nd & 4th Saturdays';
        break;
      case 'CUSTOM':
        if (saturdayOffWeeks.length > 0) {
          saturdayDesc = `${saturdayOffWeeks.map((w) => WEEK_LABELS[w - 1]).join(', ')} Saturdays`;
        }
        break;
    }

    const parts = [...nonSatOff];
    if (saturdayDesc) parts.push(saturdayDesc);
    return parts.length === 0 ? 'None' : parts.join(', ');
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    if (isEditing && initialData && localStatus !== initialData.status) {
      try {
        await changeWeeklyOffStatus({ id: initialData.id, status: localStatus });
        setStatusError(null);
      } catch (err) {
        setStatusError((err as ApiError)?.response?.data?.message || 'Failed to update status');
        return;
      }
    }

    try {
      const payload: ICreateWeeklyOffForm = {
        name: name.trim(),
        working_days: workingDays,
        saturday_rule: saturdayRule,
        saturday_off_weeks: saturdayRule === 'CUSTOM' ? saturdayOffWeeks : undefined,
      };
      if (isEditing && initialData) {
        await updateWeeklyOff({ id: initialData.id, data: payload });
      } else {
        await createWeeklyOff(payload);
      }
      onClose();
    } catch {
      // error handled in hook
    }
  };

  const actions = (
    <>
      <Button variant="secondary" onClick={onClose} style={{ flex: 1 }} disabled={isSaving}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSubmit} style={{ flex: 1 }} disabled={isSaving}>
        {isSaving ? 'Saving...' : isEditing ? 'Update' : 'Save'}
      </Button>
    </>
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Weekly Off Pattern' : 'Create Weekly Off Pattern'}
      position="right"
      maxWidth="480px"
      actions={actions}
    >
      <div style={{ marginBottom: '24px' }}>
        <Input
          label="Pattern Name*"
          placeholder="e.g., Standard Weekend"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary-500)' }}>
          Active Working Days*
        </div>
        <div className={styles.daysContainer}>
          {DAYS.map((day) => (
            <button
              key={day.id}
              type="button"
              className={`${styles.dayButton} ${workingDays.includes(day.id) ? styles.selected : ''}`}
              onClick={() => toggleDay(day.id)}
            >
              {day.label}
            </button>
          ))}
          {/* Saturday button — state driven by saturdayRule */}
          <button
            type="button"
            className={`${styles.dayButton} ${getSaturdayDayButtonClass()}`}
            onClick={handleSaturdayDayClick}
            title="Click to toggle all working / all off. Use the section below for alternate patterns."
          >
            S
          </button>
        </div>
        <div className={styles.helpText}>
          Selected days will be counted as regular working days for payroll.
        </div>
      </div>

      {/* Saturday Schedule */}
      <div className={styles.saturdaySection}>
        <div className={styles.saturdayTitle}>Saturday Schedule</div>
        <div className={styles.saturdayOptions}>
          {SATURDAY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`${styles.saturdayOption} ${saturdayRule === opt.value ? styles.selected : ''}`}
              onClick={() => setSaturdayRule(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {saturdayRule === 'CUSTOM' && (
          <div>
            <div
              style={{
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                marginBottom: '8px',
              }}
            >
              Select which Saturdays are off:
            </div>
            <div className={styles.weeksContainer}>
              {WEEK_LABELS.map((label, i) => {
                const week = i + 1;
                return (
                  <button
                    key={week}
                    type="button"
                    className={`${styles.weekChip} ${saturdayOffWeeks.includes(week) ? styles.selected : ''}`}
                    onClick={() => toggleSaturdayWeek(week)}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {isEditing && (
        <div className={styles.saturdaySection}>
          <div className={styles.saturdayTitle}>Status</div>
          <div
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
          >
            <div>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--color-text-primary-500)',
                }}
              >
                {localStatus === Status.ACTIVE ? 'Active' : 'Inactive'}
              </span>
              {statusError && (
                <p style={{ fontSize: '12px', color: 'var(--color-error)', marginTop: '4px' }}>
                  {statusError}
                </p>
              )}
            </div>
            <ToggleButton
              checked={localStatus === Status.ACTIVE}
              onChange={(v) => {
                setLocalStatus(v ? Status.ACTIVE : Status.INACTIVE);
                setStatusError(null);
              }}
            />
          </div>
        </div>
      )}

      <div className={styles.previewBox}>
        <div className={styles.previewHeader}>PREVIEW</div>
        <div className={styles.previewTitle}>Schedule Summary</div>
        <div className={styles.previewText}>
          Employees assigned to this pattern will be off on: <br />
          <span className={styles.highlight}>{getPreviewDescription()}</span>
        </div>
      </div>
    </Dialog>
  );
};

export default CreateWeeklyOffModal;
