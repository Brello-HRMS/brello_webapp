import React, { useState } from 'react';
import { Edit2, Check, X } from 'lucide-react';

import { Dialog } from '../../../components/common/Dialog/Dialog';
import { useUpdateLeaveBalance } from '../../../hooks/useLeaveBalances';
import styles from '../styles/EmployeeBalanceModal.module.scss';

import type { BalanceView, ListBalanceItem } from '../../../api/leaveBalances';

interface EmployeeBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: ListBalanceItem | null;
}

export const EmployeeBalanceModal: React.FC<EmployeeBalanceModalProps> = ({
  isOpen,
  onClose,
  employee,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [reason] = useState('Administrative update');

  const { mutate: updateBalance, isPending } = useUpdateLeaveBalance();

  if (!employee) return null;

  const handleUpdate = (balanceId: string) => {
    updateBalance(
      { id: balanceId, data: { allocated_days: editValue, reason } },
      {
        onSuccess: () => setEditingId(null),
      },
    );
  };

  const getLeaveTypeCode = (b: BalanceView) => {
    if (b.leave_type_code) return b.leave_type_code;
    return b.leave_type_name
      .split(' ')
      .map((w: string) => w[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Dialog
      title="Employee Leave Balance"
      open={isOpen}
      onClose={onClose}
      maxWidth="500px"
      position="right"
    >
      <div className={styles.modalContent}>
        <div className={styles.empProfileCard}>
          <img
            src={
              employee.employee_avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.employee_name)}&background=random`
            }
            alt={employee.employee_name}
            className={styles.largeAvatar}
          />
          <div className={styles.profileInfo}>
            <span className={styles.name}>{employee.employee_name}</span>
            <span className={styles.role}>
              {employee.designation_name || 'Designation Not Set'}
            </span>
            <span className={styles.deptBadge}>{employee.department_name || 'N/A'}</span>
          </div>
        </div>

        <div className={styles.leaveBalanceHeader}>LEAVE BALANCE</div>

        <div className={styles.balanceGrid}>
          {employee.balances.map((b) => (
            <div key={b.leave_type_id} className={styles.balanceCard}>
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>{getLeaveTypeCode(b)}</span>
                {editingId === b.id ? (
                  <div className={styles.editInputSmall}>
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(Number(e.target.value))}
                      step="0.5"
                      autoFocus
                    />
                    <Check
                      size={14}
                      className={styles.saveIcon}
                      onClick={() => b.id && !isPending && handleUpdate(b.id)}
                    />
                    <X size={14} className={styles.cancelIcon} onClick={() => setEditingId(null)} />
                  </div>
                ) : (
                  !b.is_unlimited &&
                  b.id && (
                    <Edit2
                      size={12}
                      className={styles.editIconSmall}
                      onClick={() => {
                        setEditingId(b.id);
                        setEditValue(b.allocated_days || 0);
                      }}
                    />
                  )
                )}
              </div>
              <div className={`${styles.cardValue} ${getLeaveTypeCode(b).toLowerCase()}`}>
                {String(Math.floor(b.available_days || 0)).padStart(2, '0')} Days
              </div>
            </div>
          ))}
        </div>
      </div>
    </Dialog>
  );
};
