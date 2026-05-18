import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';

import { Input } from '../../../components/ui/Input/Input';
import { ToggleButton } from '../../../components/common/ToggleButton/ToggleButton';

import styles from './LeaveRulesCard.module.scss';

import type { LeaveConfigFormValues } from '../schemas/leaveConfig.schema';

export const LeaveRulesCard: React.FC = () => {
  const { control, watch } = useFormContext<LeaveConfigFormValues>();

  const totalLeaveDays = watch('totalLeave');
  const leaveTypes = watch('leaveTypes') || [];
  const allocatedDays = leaveTypes.reduce((sum, type) => sum + (Number(type.days) || 0), 0);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>Leave Year, Total Leave & Rules</h3>
      </div>
      <div className={styles.content}>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>TOTAL LEAVE DAYS</div>
          <p className={styles.description}>Set no.of leave available per year for an employee</p>
          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <Controller
                name="totalLeave"
                control={control}
                render={({ field, fieldState }) => (
                  <Input
                    type="number"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                    error={fieldState.error?.message}
                  />
                )}
              />
            </div>
            <span className={styles.inputSuffix}>Days</span>
          </div>
          <div
            className={`${styles.badge} ${allocatedDays !== totalLeaveDays ? styles.error : ''}`}
          >
            {allocatedDays}/{totalLeaveDays || 0} Allocated
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>RULES</div>

          <div className={styles.rulesList}>
            <div className={styles.ruleItem}>
              <div className={styles.ruleInfo}>
                <h4>Approval required</h4>
                <p>Leave requests need manager approval</p>
              </div>
              <Controller
                name="rules.approvalRequired"
                control={control}
                render={({ field }) => (
                  <ToggleButton checked={field.value} onChange={field.onChange} />
                )}
              />
            </div>

            <div className={styles.ruleItem}>
              <div className={styles.ruleInfo}>
                <h4>Max Leave Per Month</h4>
                <p>Limit how many days can be taken in one month</p>
              </div>
              <div className={styles.inputGroup}>
                <div className={styles.inputWrapper}>
                  <Controller
                    name="rules.maxPerMonth"
                    control={control}
                    render={({ field, fieldState }) => (
                      <Input
                        type="number"
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : undefined)
                        }
                        error={fieldState.error?.message}
                      />
                    )}
                  />
                </div>
                <span className={styles.inputSuffix}>Days</span>
              </div>
            </div>

            <div className={styles.ruleItem}>
              <div className={styles.ruleInfo}>
                <h4>Allow Half Day</h4>
                <p>Employees can apply for half-day leave</p>
              </div>
              <Controller
                name="rules.allowHalfDay"
                control={control}
                render={({ field }) => (
                  <ToggleButton checked={field.value} onChange={field.onChange} />
                )}
              />
            </div>

            <div className={styles.ruleItem}>
              <div className={styles.ruleInfo}>
                <h4>Backdates Leave</h4>
                <p>Allow leave application for past dates</p>
              </div>
              <Controller
                name="rules.allowBackdated"
                control={control}
                render={({ field }) => (
                  <ToggleButton checked={field.value} onChange={field.onChange} />
                )}
              />
            </div>

            {watch('rules.allowBackdated') && (
              <div className={styles.ruleItem}>
                <div className={styles.ruleInfo}>
                  <h4>Max Backdated Days</h4>
                  <p>Limit how many days in the past leave can be applied</p>
                </div>
                <div className={styles.inputGroup}>
                  <div className={styles.inputWrapper}>
                    <Controller
                      name="rules.maxBackdatedDays"
                      control={control}
                      render={({ field, fieldState }) => (
                        <Input
                          type="number"
                          value={field.value ?? ''}
                          onChange={(e) =>
                            field.onChange(e.target.value ? Number(e.target.value) : undefined)
                          }
                          error={fieldState.error?.message}
                        />
                      )}
                    />
                  </div>
                  <span className={styles.inputSuffix}>Days</span>
                </div>
              </div>
            )}

            <div className={styles.ruleItem}>
              <div className={styles.ruleInfo}>
                <h4>Sandwich Rule</h4>
              </div>
              <Controller
                name="rules.sandwichRule"
                control={control}
                render={({ field }) => (
                  <ToggleButton checked={field.value} onChange={field.onChange} />
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
