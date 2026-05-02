import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

import { Button } from '../../../components/common/Button/Button';
import { Select } from '../../../components/ui/Select/Select';
import { Input } from '../../../components/ui/Input/Input';

import styles from './LeaveTypesCard.module.scss';

interface LeaveType {
  id: string;
  name: string;
  days: string;
  accrual: string;
}

const ACCRUAL_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export const LeaveTypesCard: React.FC = () => {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([
    { id: '1', name: 'Casual Leave', days: '8', accrual: 'none' },
    { id: '2', name: 'Sick Leave', days: '6', accrual: 'none' },
    { id: '3', name: 'Earned Leave', days: '10', accrual: 'monthly' },
  ]);

  const handleAddLeaveType = () => {
    setLeaveTypes([
      ...leaveTypes,
      {
        id: Date.now().toString(),
        name: '',
        days: '',
        accrual: 'none',
      },
    ]);
  };

  const handleRemoveLeaveType = (id: string) => {
    setLeaveTypes(leaveTypes.filter((lt) => lt.id !== id));
  };

  const updateLeaveType = (id: string, field: keyof LeaveType, value: string) => {
    setLeaveTypes(leaveTypes.map((lt) => (lt.id === id ? { ...lt, [field]: value } : lt)));
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>Leave Types</h3>
      </div>
      <div className={styles.content}>
        <div className={styles.badge}>24/24 Allocated</div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Distribute total leave across types</div>

          <div className={styles.tableHeader}>
            <div className={styles.colName}>Leave type</div>
            <div className={styles.colDays}>Days</div>
            <div className={styles.colAccrual}>Accrual</div>
            <div className={styles.colAction}></div>
          </div>

          <div className={styles.leaveTypesList}>
            {leaveTypes.map((leaveType) => (
              <div key={leaveType.id} className={styles.leaveTypeRow}>
                <div className={styles.colName}>
                  <Input
                    value={leaveType.name}
                    onChange={(e) => updateLeaveType(leaveType.id, 'name', e.target.value)}
                    placeholder="Leave Name"
                  />
                </div>
                <div className={styles.colDays}>
                  <Input
                    type="number"
                    value={leaveType.days}
                    onChange={(e) => updateLeaveType(leaveType.id, 'days', e.target.value)}
                  />
                </div>
                <div className={styles.colAccrual}>
                  <Select
                    value={leaveType.accrual}
                    onChange={(e) => updateLeaveType(leaveType.id, 'accrual', e.target.value)}
                    options={ACCRUAL_OPTIONS}
                  />
                </div>
                <div className={styles.colAction}>
                  <button
                    className={styles.removeBtn}
                    onClick={() => handleRemoveLeaveType(leaveType.id)}
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
