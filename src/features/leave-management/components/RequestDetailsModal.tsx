import React, { useState } from 'react';

import { Dialog, Button } from '../../../components/common';
import styles from '../styles/RequestDetailsModal.module.scss';
import {
  useLeaveRequestDetails,
  useApproveLeaveRequest,
  useRejectLeaveRequest,
} from '../../../hooks/useLeaveRequests';
import { LeaveRequestStatus } from '../../../types/leaveRequest';

interface RequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string | null;
}

export const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({
  isOpen,
  onClose,
  requestId,
}) => {
  const [comment, setComment] = useState('');
  const { data: request, isLoading: isFetching } = useLeaveRequestDetails(
    requestId || '',
    !!requestId && isOpen,
  );
  const { mutate: approveRequest, isPending: isApproving } = useApproveLeaveRequest();
  const { mutate: rejectRequest, isPending: isRejecting } = useRejectLeaveRequest();

  if (!isOpen) return null;

  const handleAction = (action: 'approve' | 'reject') => {
    if (!requestId) return;
    if (action === 'approve') {
      approveRequest({ id: requestId, comment }, { onSuccess: () => onClose() });
    } else {
      rejectRequest({ id: requestId, rejection_reason: comment }, { onSuccess: () => onClose() });
    }
  };

  const isLoading = isApproving || isRejecting;

  const actions =
    request?.status === LeaveRequestStatus.PENDING ? (
      <div className={styles.modalFooter}>
        <Button
          variant="secondary"
          onClick={() => handleAction('reject')}
          disabled={isLoading || isFetching}
          className={styles.rejectBtn}
        >
          Reject request
        </Button>
        <Button
          variant="primary"
          onClick={() => handleAction('approve')}
          isLoading={isLoading}
          disabled={isFetching}
          className={styles.approveBtn}
        >
          Approve leave
        </Button>
      </div>
    ) : null;

  return (
    <Dialog
      title="Request Details"
      open={isOpen}
      onClose={onClose}
      actions={actions}
      maxWidth="500px"
      position="right"
    >
      {isFetching ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>Loading details...</div>
      ) : !request ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>No request found</div>
      ) : (
        <div className={styles.modalBody} style={{ maxHeight: '100%', overflowY: 'auto' }}>
          <div className={styles.empProfileCard}>
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(request.employee_name)}&background=random`}
              alt={request.employee_name}
              className={styles.largeAvatar}
            />
            <div className={styles.profileInfo}>
              <span className={styles.name}>{request.employee_name}</span>
              <span className={styles.role}>Employee</span>
              <span className={styles.deptBadge}>{request.department_name || 'N/A'}</span>
            </div>
          </div>

          <div className={styles.section}>
            <span className={styles.sectionTitle}>Leave Information</span>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label>Leave Type</label>
                <div className={styles.box}>{request.leave_type.name}</div>
              </div>
              <div className={styles.infoItem}>
                <label>Total Days</label>
                <div className={styles.box}>{request.total_days} Days</div>
              </div>
              <div className={styles.infoItem}>
                <label>From</label>
                <div className={styles.box}>{new Date(request.from_date).toLocaleDateString()}</div>
              </div>
              <div className={styles.infoItem}>
                <label>To</label>
                <div className={styles.box}>{new Date(request.to_date).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <span className={styles.sectionTitle}>Reason</span>
            <div className={styles.reasonBox}>{request.reason || 'No reason provided.'}</div>
          </div>

          {request.status === LeaveRequestStatus.PENDING && (
            <div className={styles.reviewNotes}>
              <label>Review Notes</label>
              <textarea
                placeholder="Add a comment or note for the employee..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
};
