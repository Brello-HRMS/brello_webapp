import React, { useState } from 'react';

import { Input } from '../../../components/ui/Input/Input';
import { ToggleButton } from '../../../components/common/ToggleButton/ToggleButton';

import styles from './LeaveRulesCard.module.scss';

export const LeaveRulesCard: React.FC = () => {
  const [totalLeaveDays, setTotalLeaveDays] = useState('24');
  const [approvalRequired, setApprovalRequired] = useState(true);
  const [maxLeavePerMonth, setMaxLeavePerMonth] = useState('3');
  const [allowHalfDay, setAllowHalfDay] = useState(true);
  const [backdatesLeave, setBackdatesLeave] = useState(true);
  const [sandwichRule, setSandwichRule] = useState(false);

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
              <Input
                type="number"
                value={totalLeaveDays}
                onChange={(e) => setTotalLeaveDays(e.target.value)}
              />
            </div>
            <span className={styles.inputSuffix}>Days</span>
          </div>
          <div className={styles.badge}>
            {totalLeaveDays}/{totalLeaveDays} Allocated
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
              <ToggleButton checked={approvalRequired} onChange={setApprovalRequired} />
            </div>

            <div className={styles.ruleItem}>
              <div className={styles.ruleInfo}>
                <h4>Max Leave Per Month</h4>
                <p>Limit how many days can be taken in one month</p>
              </div>
              <div className={styles.inputGroup}>
                <div className={styles.inputWrapper}>
                  <Input
                    type="number"
                    value={maxLeavePerMonth}
                    onChange={(e) => setMaxLeavePerMonth(e.target.value)}
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
              <ToggleButton checked={allowHalfDay} onChange={setAllowHalfDay} />
            </div>

            <div className={styles.ruleItem}>
              <div className={styles.ruleInfo}>
                <h4>Backdates Leave</h4>
                <p>Allow leave application for past dates</p>
              </div>
              <ToggleButton checked={backdatesLeave} onChange={setBackdatesLeave} />
            </div>

            <div className={styles.ruleItem}>
              <div className={styles.ruleInfo}>
                <h4>Sandwich Rule</h4>
              </div>
              <ToggleButton checked={sandwichRule} onChange={setSandwichRule} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
