import React from 'react';
import { useFormContext, useFieldArray, Controller } from 'react-hook-form';
import { Plus, X } from 'lucide-react';

import { Button } from '../../../components/common/Button/Button';
import { Select } from '../../../components/ui/Select/Select';
import { Input } from '../../../components/ui/Input/Input';

import styles from './LeaveTypesCard.module.scss';

import type { LeaveConfigFormValues } from '../schemas/leaveConfig.schema';

const ACCRUAL_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export const LeaveTypesCard: React.FC = () => {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<LeaveConfigFormValues>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'leaveTypes',
  });

  const totalLeaveDays = watch('totalLeave') || 0;
  const leaveTypes = watch('leaveTypes') || [];
  const allocatedDays = leaveTypes.reduce((sum, type) => sum + (Number(type.days) || 0), 0);
  const isOverAllocated = allocatedDays !== totalLeaveDays;

  const handleAddLeaveType = () => {
    append({
      name: '',
      days: 0,
      accrual: 'none',
      allowHalfDay: false,
    });
  };

  return (
    <div id="leave-types-card" className={styles.card}>
      <div className={styles.header}>
        <h3>Leave Types</h3>
      </div>
      <div className={styles.content}>
        <div className={`${styles.badge} ${isOverAllocated ? styles.error : ''}`}>
          {allocatedDays}/{totalLeaveDays} Allocated
        </div>
        {errors.leaveTypes?.root?.message && (
          <p
            className={styles.errorMessage}
            style={{ color: 'red', fontSize: '0.875rem', marginTop: '0.5rem' }}
          >
            {errors.leaveTypes.root.message}
          </p>
        )}

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Distribute total leave across types</div>

          <div className={styles.tableHeader}>
            <div className={styles.colName}>Leave type</div>
            <div className={styles.colDays}>Days</div>
            <div className={styles.colAccrual}>Accrual</div>
            <div className={styles.colAction}></div>
          </div>

          <div className={styles.leaveTypesList}>
            {fields.map((field, index) => (
              <div key={field.id} className={styles.leaveTypeRow}>
                <div className={styles.colName}>
                  <Controller
                    name={`leaveTypes.${index}.name`}
                    control={control}
                    render={({ field: inputField, fieldState }) => (
                      <Input
                        value={inputField.value}
                        onChange={inputField.onChange}
                        placeholder="Leave Name"
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </div>
                <div className={styles.colDays}>
                  <Controller
                    name={`leaveTypes.${index}.days`}
                    control={control}
                    render={({ field: inputField, fieldState }) => (
                      <Input
                        type="number"
                        value={inputField.value}
                        onChange={(e) =>
                          inputField.onChange(e.target.value ? Number(e.target.value) : 0)
                        }
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </div>
                <div className={styles.colAccrual}>
                  <Controller
                    name={`leaveTypes.${index}.accrual`}
                    control={control}
                    render={({ field: inputField }) => (
                      <Select
                        value={inputField.value}
                        onChange={(e) => inputField.onChange(e.target.value)}
                        options={ACCRUAL_OPTIONS}
                      />
                    )}
                  />
                </div>
                <div className={styles.colAction}>
                  <button
                    className={styles.removeBtn}
                    onClick={() => remove(index)}
                    type="button"
                    title="Remove leave type"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.addBtnWrapper}>
            <Button variant="secondary" onClick={handleAddLeaveType}>
              <Plus size={16} />
              Add leave type
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
