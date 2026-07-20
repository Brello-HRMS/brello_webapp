import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

import { PageHeader, ListControls, Button, NoDataFound } from '../../components/common';
import {
  usePendingApprovals,
  useApproveOfferStep,
  useRejectOfferStep,
} from '../../features/offer-management/hooks/useOffers';

import styles from './OfferApprovalsPage.module.scss';

const formatCurrency = (amount: number | null | undefined) => {
  if (!amount) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function OfferApprovalsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Reject modal state
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: response, isLoading } = usePendingApprovals();
  const pendingApprovals = useMemo(() => response?.data ?? [], [response]);

  const approveMutation = useApproveOfferStep();
  const rejectMutation = useRejectOfferStep();

  const openRejectModal = (offerId: string) => {
    setRejectTargetId(offerId);
    setRejectReason('');
  };

  const closeRejectModal = () => {
    setRejectTargetId(null);
    setRejectReason('');
  };

  const confirmReject = () => {
    if (!rejectTargetId || !rejectReason.trim()) return;
    rejectMutation.mutate(
      { id: rejectTargetId, comment: rejectReason.trim() },
      { onSuccess: closeRejectModal },
    );
  };

  return (
    <div className={`${styles.page} ${isLoading ? styles.loading : ''}`}>
      <PageHeader
        title="My Approvals"
        subtitle="Offers pending your review and approval before they can be sent."
        titleExtra={<Clock size={20} />}
      />

      <ListControls
        showSearch
        showFilters={false}
        showSort={false}
        showViewSwitcher={false}
        showMultiSelect={false}
        searchPlaceholder="Search by offer number or candidate..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {pendingApprovals.length === 0 ? (
        <NoDataFound
          title="No Pending Approvals"
          description="You have no offers waiting for your approval at this time."
        />
      ) : (
        <div className={styles.approvalsList}>
          {pendingApprovals.map(({ step, offer }) => (
            <div key={offer.id} className={styles.approvalCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.candidateName}>
                    {offer.candidate?.first_name} {offer.candidate?.last_name}
                  </h3>
                  <div className={styles.offerMeta}>
                    <span className={styles.position}>{offer.position || 'Unknown Position'}</span>
                    <span className={styles.dot}>•</span>
                    <span className={styles.offerNumber}>{offer.offer_number || 'Draft'}</span>
                  </div>
                </div>
                <div className={styles.compensationInfo}>
                  <div className={styles.ctcLabel}>Annual CTC</div>
                  <div className={styles.ctcValue}>{formatCurrency(offer.ctc_annual || 0)}</div>
                </div>
              </div>

              <div className={styles.stepInfo}>
                <p>
                  You are requested to approve this offer as <strong>{step.role_name}</strong> (Step{' '}
                  {step.step_order}).
                </p>
              </div>

              <div className={styles.cardActions}>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/offer-management/offers/${offer.id}`)}
                >
                  View Offer Details
                </Button>
                <div className={styles.actionButtons}>
                  <Button
                    variant="danger"
                    onClick={() => openRejectModal(offer.id)}
                    disabled={rejectMutation.isPending}
                  >
                    <XCircle size={16} /> Reject
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => approveMutation.mutate({ id: offer.id })}
                    disabled={approveMutation.isPending}
                  >
                    <CheckCircle size={16} /> Approve
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject modal */}
      {rejectTargetId && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Reject Offer Step</h3>
            <p>
              Please provide a reason for rejecting this offer. This will be recorded in the audit
              trail.
            </p>
            <textarea
              className={styles.textarea}
              placeholder="e.g. Compensation exceeds budget approval..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
            />
            <div className={styles.modalActions}>
              <Button variant="ghost" onClick={closeRejectModal}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmReject}
                disabled={!rejectReason.trim() || rejectMutation.isPending}
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Confirm Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
