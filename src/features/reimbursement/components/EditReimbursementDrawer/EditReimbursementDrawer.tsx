import React, { useEffect } from 'react';
import { useForm, Controller, type SubmitHandler, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Download } from 'lucide-react';

import { Dialog } from '../../../../components/common/Dialog/Dialog';
import { Select, type SelectOption } from '../../../../components/common/Select/Select';
import { TextArea } from '../../../../components/ui/TextArea/TextArea';
import { Button } from '../../../../components/common/Button/Button';
import {
  useUpdateReimbursementStatus,
  useMarkReimbursementPaid,
} from '../../hooks/useAdminReimbursement';
import { editStatusSchema, type EditStatusFormData } from '../../validation/reimbursementSchema';
import { ReimbursementStatus } from '../../types/reimbursementTypes';
import { getInitials } from '../../../../utils/stringUtils';
import { formatINR } from '../../../../utils/numberUtils';

import styles from './EditReimbursementDrawer.module.scss';

import type { Reimbursement } from '../../types/reimbursementTypes';

interface EditReimbursementDrawerProps {
  reimbursement: Reimbursement | null;
  onClose: () => void;
}

const STATUS_OPTIONS: SelectOption[] = [
  { value: ReimbursementStatus.PENDING, label: 'Pending' },
  { value: ReimbursementStatus.APPROVED, label: 'Approved' },
  { value: ReimbursementStatus.REJECTED, label: 'Rejected' },
];

export const EditReimbursementDrawer: React.FC<EditReimbursementDrawerProps> = ({
  reimbursement,
  onClose,
}) => {
  const { updateStatus, isUpdating } = useUpdateReimbursementStatus();
  const { markPaid, isMarking } = useMarkReimbursementPaid();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EditStatusFormData>({
    resolver: zodResolver(editStatusSchema),
    defaultValues: { status: 'Pending', rejection_reason: '', is_paid: false },
  });

  const watchedStatus = useWatch({
    control,
    name: 'status',
  });

  useEffect(() => {
    if (reimbursement) {
      reset({
        status: reimbursement.reimb_status as EditStatusFormData['status'],
        rejection_reason: reimbursement.rejection_reason ?? '',
        is_paid: reimbursement.is_paid,
      });
    }
  }, [reimbursement, reset]);

  const isSaving = isUpdating || isMarking;

  const onSubmit: SubmitHandler<EditStatusFormData> = async (data) => {
    if (!reimbursement) return;

    const statusChanged = data.status !== reimbursement.reimb_status;
    const paidChanged = data.is_paid && !reimbursement.is_paid;

    if (
      statusChanged &&
      (data.status === ReimbursementStatus.APPROVED || data.status === ReimbursementStatus.REJECTED)
    ) {
      await updateStatus({
        id: reimbursement.id,
        data: {
          status: data.status as ReimbursementStatus.APPROVED | ReimbursementStatus.REJECTED,
          rejection_reason: data.rejection_reason,
        },
      });
    }

    if (paidChanged) {
      await markPaid(reimbursement.id);
    }

    onClose();
  };

  const employee = reimbursement?.employee;
  const employeeName = employee?.name ?? '—';

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Dialog
      title="Edit Reimbursement Request"
      open={!!reimbursement}
      onClose={onClose}
      maxWidth="480px"
      position="right"
      actions={
        <div className={styles.footer}>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit(onSubmit)} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      }
    >
      {reimbursement && (
        <div className={styles.body}>
          {/* Employee header */}
          <div className={styles.employeeHeader}>
            <div className={styles.avatar}>{getInitials(employeeName)}</div>
            <div className={styles.employeeInfo}>
              <span className={styles.employeeName}>{employeeName}</span>
              {employee?.employee_code && (
                <span className={styles.employeeCode}>ID: {employee.employee_code}</span>
              )}
            </div>
          </div>

          {/* Read-only details */}
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Title</span>
            <div className={styles.readField}>
              <span className={styles.fieldValue}>{reimbursement.title}</span>
            </div>
          </div>

          {reimbursement.expense_description && (
            <div className={styles.section}>
              <span className={styles.sectionLabel}>Description</span>
              <span className={styles.fieldValue}>{reimbursement.expense_description}</span>
            </div>
          )}

          <div className={styles.row}>
            <div className={styles.section}>
              <span className={styles.sectionLabel}>Expense</span>
              <span className={styles.fieldLabel}>Date</span>
              <span className={styles.fieldValue}>{formatDate(reimbursement.expense_date)}</span>
            </div>
            <div className={styles.section}>
              <span className={styles.sectionLabel}>Amount</span>
              <span className={styles.fieldValue}>{formatINR(reimbursement.amount)}</span>
            </div>
          </div>

          {/* Attachments */}
          {reimbursement.attachments?.length > 0 && (
            <div className={styles.section}>
              <span className={styles.sectionLabel}>Attachments</span>
              <div className={styles.attachmentList}>
                {reimbursement.attachments.map((att) => (
                  <div key={att.id} className={styles.attachmentItem}>
                    <FileText
                      size={14}
                      style={{ color: 'var(--color-primary-border)', flexShrink: 0 }}
                    />
                    <span className={styles.attachmentName}>
                      {att.original_name ?? att.document_id}
                    </span>
                    {att.url && (
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.attachmentAction}
                        title="Download"
                      >
                        <Download size={14} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <hr className={styles.divider} />

          {/* Status management */}
          <div className={styles.statusSection}>
            <span className={styles.statusSectionTitle}>Status Management</span>

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  label="Request Status"
                  required
                  options={STATUS_OPTIONS}
                  value={field.value}
                  onChange={(val) => field.onChange(String(val))}
                  error={errors.status?.message}
                />
              )}
            />

            {watchedStatus === ReimbursementStatus.REJECTED && (
              <div>
                <TextArea
                  label="Rejection Reason"
                  required
                  placeholder="Provide details on why this request was rejected..."
                  rows={3}
                  error={errors.rejection_reason?.message}
                  {...register('rejection_reason')}
                />
                <p className={styles.rejectionNote}>
                  This comment will be visible to the employee.
                </p>
              </div>
            )}

            <div className={styles.paidRow}>
              <div className={styles.paidLabel}>
                <span className={styles.paidTitle}>Mark as Paid</span>
                <span className={styles.paidHint}>Enable payment processing</span>
              </div>
              <div className={styles.paidToggle}>
                <Controller
                  name="is_paid"
                  control={control}
                  render={({ field }) => (
                    <button
                      type="button"
                      className={`${styles.toggleBtn} ${field.value ? styles.active : ''}`}
                      onClick={() => field.onChange(!field.value)}
                      disabled={reimbursement.is_paid}
                      title={reimbursement.is_paid ? 'Already paid' : 'Toggle paid'}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
};
