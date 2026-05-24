import React from 'react';
import { CheckCircle2, User, Building2, Wallet, FileCheck } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '../../../../../components/common';
import { useWizard } from '../WizardContext';
import { useEmployeeWizard } from '../../../hooks/useEmployeeWizard';

import styles from './ReviewInviteStep.module.scss';

interface ReviewInviteStepProps {
  onClose: () => void;
}

export const ReviewInviteStep: React.FC<ReviewInviteStepProps> = ({ onClose }) => {
  const { employeeId, formData, resetWizard, isEditMode } = useWizard();
  const { finalizeMutation } = useEmployeeWizard();
  const queryClient = useQueryClient();

  const handleFinalize = () => {
    if (isEditMode) {
      // In edit mode, just invalidate queries and close
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', employeeId] });
      resetWizard();
      onClose();
      return;
    }

    if (!employeeId) return;

    finalizeMutation.mutate(employeeId, {
      onSuccess: () => {
        resetWizard();
        onClose();
      },
    });
  };

  const isPending = finalizeMutation.isPending;

  return (
    <div className={styles.container}>
      <div className={styles.successAnimation}>
        <CheckCircle2 size={64} className={styles.successIcon} />
        <h2 className={styles.title}>
          {isEditMode ? 'Changes saved!' : 'All set! Ready to onboard?'}
        </h2>
        <p className={styles.subtitle}>
          {isEditMode
            ? 'Review the updated details below.'
            : 'Review the details below before sending the invitation.'}
        </p>
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.cardHeader}>
            <User size={18} />
            <span>Personal Info</span>
          </div>
          <div className={styles.cardContent}>
            <p className={styles.mainInfo}>
              {formData.firstName} {formData.lastName}
            </p>
            <p className={styles.subInfo}>{formData.email}</p>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.cardHeader}>
            <Building2 size={18} />
            <span>Employment</span>
          </div>
          <div className={styles.cardContent}>
            <p className={styles.mainInfo}>Joining on {formData.joiningDate || 'Date not set'}</p>
            <p className={styles.subInfo}>{formData.workLocation || 'Onsite'}</p>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.cardHeader}>
            <Wallet size={18} />
            <span>Payroll</span>
          </div>
          <div className={styles.cardContent}>
            <p className={styles.mainInfo}>{formData.taxRegime || 'New'} Regime</p>
            <p className={styles.subInfo}>
              {formData.bankName ? `Bank: ${formData.bankName}` : 'Bank details pending'}
            </p>
          </div>
        </div>

        <div className={styles.summaryCard}>
          <div className={styles.cardHeader}>
            <FileCheck size={18} />
            <span>Documents</span>
          </div>
          <div className={styles.cardContent}>
            <p className={styles.mainInfo}>Docs uploaded</p>
            <p className={styles.subInfo}>Ready for verification</p>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <Button
          variant="secondary"
          onClick={onClose}
          className={styles.saveDraftButton}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleFinalize}
          className={styles.nextButton}
          isLoading={isPending}
        >
          {isEditMode ? 'Save Changes' : 'Finish & Invite Employee'}
        </Button>
      </div>
    </div>
  );
};
