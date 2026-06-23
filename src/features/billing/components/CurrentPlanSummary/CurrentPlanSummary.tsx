import React from 'react';
import { SendHorizonal } from 'lucide-react';

import styles from './CurrentPlanSummary.module.scss';

import type { SubscriptionOverviewData } from '../../types';

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

interface CurrentPlanSummaryProps {
  overview: SubscriptionOverviewData;
}

export const CurrentPlanSummary: React.FC<CurrentPlanSummaryProps> = ({ overview }) => {
  const { subscription, employee_billing, trial } = overview;

  const formattedRenewalDate = subscription.next_renewal_date
    ? new Date(subscription.next_renewal_date).toLocaleDateString('en-IN', {
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
          <h2 className={styles.planName}>{subscription.plan.name}</h2>
          <p className={styles.planDesc}>
            {trial.is_trial
              ? `${trial.days_remaining} days left in trial`
              : 'Manage your subscription and billing details'}
          </p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatItem label="Billing cycle" value={subscription.billing_cycle} />
        <StatItem label="Status" value={subscription.sub_status} />
        <StatItem label="Renewal Date" value={formattedRenewalDate} />
        <StatItem label="Active Employees" value={employee_billing.active_employees} />
        <StatItem
          label="Price Per Employee"
          value={`₹${employee_billing.price_per_employee} / month`}
        />
        <StatItem
          label="Estimated Renewal"
          highlight
          value={
            <>
              ₹{employee_billing.estimated_total.toFixed(2)}{' '}
              <span className={styles.gstNote}>(+GST {employee_billing.gst_rate}%)</span>
            </>
          }
        />
      </div>
    </div>
  );
};
