import React, { useState } from 'react';

import {
  Dialog,
  Button,
  Select,
  ToggleButton,
  LocationPickerMap,
} from '../../../../components/common';
import { Input } from '../../../../components/ui/Input/Input';
import { useRules } from '../hooks/useRules';
import { useShifts } from '../hooks/useShifts';
import { useWeeklyOffs } from '../hooks/useWeeklyOffs';
import { Status, type ApiError } from '../../../../types/common';

import styles from './CreateShiftModal.module.scss';

import type { IRule, ICreateRuleForm } from '../types/setupTypes';

interface CreateRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: IRule | null;
}

const getInitialForm = (data?: IRule | null): ICreateRuleForm => ({
  name: data?.name ?? '',
  shift_id: data?.shift_id ?? '',
  weekly_off_id: data?.weekly_off_id ?? '',
  overtime_after_hours: data?.overtime_after_hours ?? 8,
  overtime_multiplier: data?.overtime_multiplier ?? 1.5,
  require_geo_fencing: data?.require_geo_fencing ?? false,
  allow_multiple_checkins: data?.allow_multiple_checkins ?? false,
  geo_fence: data?.geo_fence
    ? {
        office_name: data.geo_fence.office_name,
        latitude: Number(data.geo_fence.latitude),
        longitude: Number(data.geo_fence.longitude),
        radius_meters: data.geo_fence.radius_meters,
      }
    : undefined,
});

// Parent should pass key={initialData?.id ?? 'new'} to force remount
const CreateRuleModal: React.FC<CreateRuleModalProps> = ({ isOpen, onClose, initialData }) => {
  const [form, setForm] = useState<ICreateRuleForm>(() => getInitialForm(initialData));
  const [localStatus, setLocalStatus] = useState<string>(initialData?.status ?? Status.ACTIVE);
  const [statusError, setStatusError] = useState<string | null>(null);

  const { createRule, isCreating, updateRule, isUpdating, changeRuleStatus, isChangingStatus } =
    useRules();
  const { shifts } = useShifts();
  const { weeklyOffs } = useWeeklyOffs();

  const isEditing = !!initialData;
  const isSaving = isCreating || isUpdating || isChangingStatus;

  const shiftOptions = shifts.map((s) => ({ label: s.name, value: s.id }));
  const weeklyOffOptions = weeklyOffs.map((w) => ({ label: w.name, value: w.id }));

  const handleChange = <K extends keyof ICreateRuleForm>(key: K, value: ICreateRuleForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.shift_id || !form.weekly_off_id) return;

    if (isEditing && initialData && localStatus !== initialData.status) {
      try {
        await changeRuleStatus({ id: initialData.id, status: localStatus });
        setStatusError(null);
      } catch (err) {
        setStatusError((err as ApiError)?.response?.data?.message || 'Failed to update status');
        return;
      }
    }

    try {
      if (isEditing && initialData) {
        await updateRule({ id: initialData.id, data: form });
      } else {
        await createRule(form);
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
      title={isEditing ? 'Edit Rule' : 'Create Rule'}
      position="right"
      maxWidth="480px"
      actions={actions}
    >
      <div className={styles.formSection}>
        <div style={{ marginBottom: '16px' }}>
          <Input
            label="Rule Name*"
            placeholder="e.g., Developer Shift"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <Select
            label="Select Shift*"
            options={shiftOptions}
            value={form.shift_id}
            onChange={(v) => handleChange('shift_id', v as string)}
            required
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <Select
            label="Weekly Off Pattern*"
            options={weeklyOffOptions}
            value={form.weekly_off_id}
            onChange={(v) => handleChange('weekly_off_id', v as string)}
            required
          />
        </div>
      </div>

      <div className={styles.formSection}>
        <div className={styles.sectionTitle}>WORKING HOUR LOGIC</div>
        <div className={styles.row}>
          <Input
            label="Overtime After (hrs)*"
            type="number"
            value={form.overtime_after_hours}
            onChange={(e) => handleChange('overtime_after_hours', Number(e.target.value))}
            required
          />
          <Input
            label="Overtime Multiplier*"
            type="number"
            value={form.overtime_multiplier}
            onChange={(e) => handleChange('overtime_multiplier', Number(e.target.value))}
            required
          />
        </div>
      </div>

      <div className={styles.formSection}>
        <div className={styles.sectionTitle}>CHECK-IN RULES</div>
        <div className={styles.toggleRow}>
          <span className={styles.toggleLabel}>Geo-Fencing Mandatory</span>
          <ToggleButton
            checked={form.require_geo_fencing}
            onChange={(v) => handleChange('require_geo_fencing', v)}
          />
        </div>

        {form.require_geo_fencing && (
          <div
            style={{
              marginTop: '16px',
              padding: '16px',
              backgroundColor: 'var(--color-gray-50)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px' }}>
              Location Details
            </div>
            <LocationPickerMap
              value={form.geo_fence}
              onChange={(loc) =>
                handleChange('geo_fence', {
                  office_name: loc.office_name,
                  latitude: loc.latitude,
                  longitude: loc.longitude,
                  radius_meters: loc.radius_meters,
                })
              }
              showRadius
            />
          </div>
        )}

        <div className={styles.toggleRow} style={{ marginTop: '16px' }}>
          <span className={styles.toggleLabel}>Allow Multiple Check-ins</span>
          <ToggleButton
            checked={form.allow_multiple_checkins ?? false}
            onChange={(v) => handleChange('allow_multiple_checkins', v)}
          />
        </div>
      </div>

      {isEditing && (
        <div className={styles.formSection}>
          <div className={styles.sectionTitle}>STATUS</div>
          <div className={styles.toggleRow}>
            <div>
              <span className={styles.toggleLabel}>
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
    </Dialog>
  );
};

export default CreateRuleModal;
