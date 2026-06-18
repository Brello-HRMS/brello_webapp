import React, { useState } from 'react';
import { Loader2, AlertTriangle, Clock, TriangleAlert, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { PageHeader } from '../../components/common/PageHeader/PageHeader';
import { Button } from '../../components/ui/Button/Button';
import { Modal } from '../../components/common/Modal/Modal';
import { CurrentPlanSummary } from '../../features/billing/components/CurrentPlanSummary/CurrentPlanSummary';
import { PricingSection } from '../../features/billing/components/PricingSection/PricingSection';
import {
  useSubscription,
  useOrgPlans,
  useChangePlan,
  useCancelPendingChange,
  useCancelSubscription,
} from '../../features/billing/hooks';
import { showToast } from '../../features/ToastFeature/ShowToast';
import { BillingCycle } from '../../features/billing/types';

import styles from './BillingPlanPage.module.scss';

const BillingPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const [cycle, setCycle] = useState<BillingCycle>(BillingCycle.MONTHLY);
  const [changingPlanId, setChangingPlanId] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { data: subscriptionRes, isLoading: isSubLoading } = useSubscription();
  const { data: plansRes, isLoading: isPlansLoading } = useOrgPlans(cycle);

  const { mutate: doChangePlan } = useChangePlan();
  const { mutate: doCancelPending, isPending: isCancellingPending } = useCancelPendingChange();
  const { mutate: doCancelSubscription, isPending: isCancelling } = useCancelSubscription();

  const overview = subscriptionRes?.data;
  const plans = plansRes?.data?.plans ?? [];
  const subscription = overview?.subscription;

  // Is there a scheduled plan change?
  const hasPendingChange = !!(subscription?.pending_plan_id || subscription?.pending_billing_cycle);

  const expiryDaysRemaining = subscription?.end_date
    ? Math.max(
        0,
        Math.ceil(
          (new Date(subscription.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        ),
      )
    : null;

  // Only surface the expiry warning when ≤ 3 days remain
  const showExpiryBanner =
    !!subscription?.renewal_cta && expiryDaysRemaining !== null && expiryDaysRemaining <= 3;

  const formattedExpiryDate = subscription?.end_date
    ? new Date(subscription.end_date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  // Find the name of the pending plan from the current plans list
  const pendingPlanName =
    hasPendingChange && subscription?.pending_plan_id
      ? (plans.find((p) => p.id === subscription.pending_plan_id)?.name ?? 'a new plan')
      : null;

  const pendingCycleLabel = subscription?.pending_billing_cycle ?? null;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleChangePlan = (planId: string) => {
    setChangingPlanId(planId);
    doChangePlan(
      { plan_id: planId, billing_cycle: cycle },
      {
        onSuccess: (res) => {
          if (res.data.applied === 'immediate') {
            showToast(
              'Plan changed! An invoice has been generated — please pay to activate.',
              'success',
            );
            navigate('/billing/invoices');
          } else {
            showToast(
              'Plan change scheduled. It will take effect at your next renewal.',
              'success',
            );
          }
        },
        onSettled: () => setChangingPlanId(null),
      },
    );
  };

  const handleCancelPendingChange = () => {
    doCancelPending();
  };

  const handleCancelSubscription = () => {
    doCancelSubscription(undefined, {
      onSuccess: () => setShowCancelModal(false),
    });
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  const isLoading = isSubLoading || isPlansLoading;

  if (isLoading) {
    return (
      <div className={styles.page}>
        <PageHeader
          title="Plan & Subscription"
          subtitle="Manage your subscription, view billing details and upgrade your plan."
        />
        <div className={styles.loader}>
          <Loader2 className={styles.spin} size={32} />
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={styles.page}>
      <PageHeader
        title="Plan & Subscription"
        subtitle="Manage your subscription, view billing details and upgrade your plan."
      />

      {/* ── Expiry warning banner ──────────────────────────────────────────── */}
      {showExpiryBanner && (
        <div className={styles.expiryBanner}>
          <div className={styles.expiryLeft}>
            <TriangleAlert size={20} className={styles.expiryIcon} />
            <div>
              <span className={styles.expiryTitle}>
                Your{' '}
                <span className={styles.expiryPlanName}>{subscription?.plan.name}</span>{' '}
                Plan is going to expire!
              </span>
              <span className={styles.expiryDesc}>
                Your current plan will expire in{' '}
                {expiryDaysRemaining !== null && (
                  <strong className={styles.expiryDays}>
                    {String(expiryDaysRemaining).padStart(2, '0')} days
                  </strong>
                )}{' '}
                {formattedExpiryDate && (
                  <>on <span className={styles.expiryDate}>{formattedExpiryDate}</span></>
                )}.
              </span>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={() => navigate('/billing/invoice')}>
            {subscription?.renewal_cta ?? 'Renew Now'}
          </Button>
        </div>
      )}

      {/* ── Pending plan-change banner ─────────────────────────────────────── */}
      {hasPendingChange && (
        <div className={styles.pendingBanner}>
          <div className={styles.pendingLeft}>
            <Clock size={16} className={styles.pendingIcon} />
            <div>
              <span className={styles.pendingTitle}>Plan change scheduled</span>
              <span className={styles.pendingDesc}>
                {pendingPlanName && (
                  <>
                    Switching to <strong>{pendingPlanName}</strong>
                    {pendingCycleLabel && <> ({pendingCycleLabel})</>} at your next renewal.
                  </>
                )}
                {!pendingPlanName && pendingCycleLabel && (
                  <>
                    Switching to <strong>{pendingCycleLabel}</strong> billing at your next renewal.
                  </>
                )}
              </span>
            </div>
          </div>
          <button
            className={styles.pendingCancelBtn}
            onClick={handleCancelPendingChange}
            disabled={isCancellingPending}
            aria-label="Cancel pending plan change"
          >
            {isCancellingPending ? <Loader2 size={14} className={styles.spin} /> : <X size={14} />}
            Cancel change
          </button>
        </div>
      )}

      {overview && <CurrentPlanSummary overview={overview} />}

      <PricingSection
        plans={plans}
        changingPlanId={changingPlanId}
        onChangePlan={handleChangePlan}
        billingCycle={cycle}
        onCycleChange={setCycle}
      />

      {/* ── Danger zone ────────────────────────────────────────────────────── */}
      {subscription && (
        <div className={styles.dangerZone}>
          <div className={styles.dangerText}>
            <AlertTriangle size={16} className={styles.dangerIcon} />
            <div>
              <span className={styles.dangerTitle}>Cancel Subscription</span>
              <span className={styles.dangerDesc}>
                Your subscription will be cancelled immediately and access may be restricted.
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className={styles.dangerBtn}
            onClick={() => setShowCancelModal(true)}
          >
            Cancel Subscription
          </Button>
        </div>
      )}

      {/* ── Cancel subscription confirmation modal ─────────────────────────── */}
      <Modal isOpen={showCancelModal} onClose={() => setShowCancelModal(false)}>
        <div className={styles.cancelModalContent}>
          <div className={styles.cancelIconWrap}>
            <AlertTriangle size={32} className={styles.cancelIcon} />
          </div>
          <h3 className={styles.cancelTitle}>Cancel Subscription?</h3>
          <p className={styles.cancelDesc}>
            Your subscription will be cancelled immediately. You may lose access to paid features
            right away. This action cannot be undone.
          </p>
          <div className={styles.cancelActions}>
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
              disabled={isCancelling}
            >
              Keep Subscription
            </Button>
            <Button
              variant="primary"
              className={styles.cancelConfirmBtn}
              isLoading={isCancelling}
              onClick={handleCancelSubscription}
            >
              Yes, Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BillingPlanPage;
