import React from 'react';
import { SendHorizonal } from 'lucide-react';

import { SubscriptionStatus } from '../../types';

import styles from './CurrentPlanSummary.module.scss';

import type { CurrentSubscription } from '../../types';

interface StatItemProps {
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, highlight }) => (
  <div className={styles.statItem}>
    <span className={styles.statLabel}>{label}</span>
    <span className={`${styles.statValue} ${highlight ? styles.highlight : ''}`}>{value}</span>
  </div>
);

const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  [SubscriptionStatus.ACTIVE]: 'Active',
  [SubscriptionStatus.INACTIVE]: 'Inactive',
  [SubscriptionStatus.TRIAL]: 'Trial',
  [SubscriptionStatus.EXPIRED]: 'Expired',
};

interface CurrentPlanSummaryProps {
  subscription: CurrentSubscription;
}

export const CurrentPlanSummary: React.FC<CurrentPlanSummaryProps> = ({ subscription }) => {
  const formattedRenewalDate = subscription.renewal_date
    ? new Date(subscription.renewal_date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '-';

  return (
    <div className={styles.card}>
      <div className={styles.planInfo}>
        <div className={styles.iconWrap}>
          <SendHorizonal size={20} />
        </div>
        <div className={styles.planText}>
          <span className={styles.planLabel}>Current Plan</span>
          <h2 className={styles.planName}>{subscription.plan_name}</h2>
          <p className={styles.planDesc}>{subscription.plan_description}</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatItem label="Billing cycle" value={subscription.billing_cycle} />
        <StatItem label="Status" value={STATUS_LABEL[subscription.status]} />
        <StatItem label="Renewal Date" value={formattedRenewalDate} />
        <StatItem label="Active Employees" value={subscription.active_employees} />
        <StatItem
          label="Price Per Employee"
          value={`₹${subscription.price_per_employee} / month`}
        />
        <StatItem
          label="Estimated Renewal"
          highlight
          value={
            <>
              ₹{subscription.estimated_renewal.toFixed(2)}{' '}
              <span className={styles.gstNote}>(+GST 18%)</span>
            </>
          }
        />
      </div>
    </div>
  );
};
