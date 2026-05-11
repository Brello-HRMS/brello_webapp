import React, { useState } from 'react';

import { Dialog, Button } from '../../../components/common';
import styles from '../styles/LeaveManagement.module.scss';

import type { LeaveRequest } from '../constants/mockData';

interface RequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: LeaveRequest | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject,
}) => {
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!request) return null;

  const handleAction = async (action: 'approve' | 'reject') => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (action === 'approve') {
      onApprove(request.id);
    } else {
      onReject(request.id);
    }
    setIsLoading(false);
    onClose();
  };

  const actions = (
    <div className={styles.modalFooter}>
      <Button
        variant="secondary"
        onClick={() => handleAction('reject')}
        disabled={isLoading}
        className={styles.rejectBtn}
      >
        Reject request
      </Button>
      <Button
        variant="primary"
        onClick={() => handleAction('approve')}
        isLoading={isLoading}
        className={styles.approveBtn}
      >
        Approve leave
      </Button>
    </div>
  );

  return (
    <Dialog
      title="Request Details"
      open={isOpen}
      onClose={onClose}
      actions={actions}
      maxWidth="500px"
      position="right"
    >
      <div className={styles.modalBody} style={{ maxHeight: '100%', overflowY: 'auto' }}>
        <div className={styles.empProfileCard}>
          <img src={request.avatar} alt={request.employeeName} className={styles.largeAvatar} />
          <div className={styles.profileInfo}>
            <span className={styles.name}>{request.employeeName}</span>
            <span className={styles.role}>{request.role}</span>
            <span className={styles.deptBadge}>{request.department}</span>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionTitle}>Leave Balance</span>
          <div className={styles.balanceGrid}>
            <div className={`${styles.balanceCard} ${styles.cl}`}>
              <span className={styles.label}>CL</span>
              <span className={`${styles.value} ${styles.cl}`}>
                {request.balances.CL.toString().padStart(2, '0')} Days
              </span>
            </div>
            <div className={`${styles.balanceCard} ${styles.sl}`}>
              <span className={styles.label}>SL</span>
              <span className={`${styles.value} ${styles.sl}`}>
                {request.balances.SL.toString().padStart(2, '0')} Days
              </span>
            </div>
            <div className={`${styles.balanceCard} ${styles.el}`}>
              <span className={styles.label}>EL</span>
              <span className={`${styles.value} ${styles.el}`}>
                {request.balances.EL.toString().padStart(2, '0')} Days
              </span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionTitle}>Leave Information</span>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label>Leave Type</label>
              <div className={styles.box}>{request.leaveType}</div>
            </div>
            <div className={styles.infoItem}>
              <label>Total Days</label>
              <div className={styles.box}>{request.duration}</div>
            </div>
            <div className={styles.infoItem}>
              <label>From</label>
              <div className={styles.box}>{request.fromDate}</div>
            </div>
            <div className={styles.infoItem}>
              <label>To</label>
              <div className={styles.box}>{request.toDate}</div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.sectionTitle}>Reason</span>
          <div className={styles.reasonBox}>{request.reason}</div>
        </div>

        <div className={styles.reviewNotes}>
          <label>
            Review Notes<span className={styles.asterisk}>*</span>
          </label>
          <textarea
            placeholder="Add a comment or note for the employee..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
      </div>
    </Dialog>
  );
};
