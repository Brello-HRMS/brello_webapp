import React, { useState } from 'react';

import { PageHeader } from '../../components/common/PageHeader/PageHeader';
import { CurrentPlanSummary } from '../../features/billing/components/CurrentPlanSummary/CurrentPlanSummary';
import { PricingSection } from '../../features/billing/components/PricingSection/PricingSection';
import { BillingCycle, SubscriptionStatus } from '../../features/billing/types';

import styles from './BillingPlanPage.module.scss';

import type { CurrentSubscription, OrgPlan } from '../../features/billing/types';

const MOCK_SUBSCRIPTION: CurrentSubscription = {
  plan_id: '',
  plan_name: 'Free',
  plan_description: 'Perfect for getting started. Upgrade anytime to unlock more features.',
  billing_cycle: BillingCycle.MONTHLY,
  status: SubscriptionStatus.ACTIVE,
  active_employees: 3,
  price_per_employee: 0,
  renewal_date: null,
  estimated_renewal: 0,
  is_trial: false,
  trial_end_date: null,
};

const MOCK_PLANS: OrgPlan[] = [
  {
    id: 'standard',
    name: 'Standard',
    tier: 'standard',
    tagline: 'Ideal for startups and small companies',
    description: 'Ideal for growing teams needing more features.',
    price_per_employee: 79,
    features: [
      'Upto 100 employees',
      'Attendance Tracking',
      'Payroll Management',
      'Priority Support',
    ],
    trial_days: 30,
  },
  {
    id: 'premium',
    name: 'Premium',
    tier: 'premium',
    tagline: 'Best for large organisations',
    description: 'Advanced features for scaling organisations.',
    price_per_employee: 149,
    features: [
      'Unlimited employees',
      'Advanced Analytics',
      'Custom Roles & Management',
      'Dedicated Support',
    ],
    trial_days: 30,
  },
];

const BillingPlanPage: React.FC = () => {
  const [upgradingPlanId, setUpgradingPlanId] = useState<string | null>(null);

  const handleUpgrade = (planId: string) => {
    setUpgradingPlanId(planId);
    // TODO: wire up upgrade API when ready
    setTimeout(() => setUpgradingPlanId(null), 1000);
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="Plan & Subscription"
        subtitle="Manage your subscription, view billing details and upgrade your plan."
      />

      <CurrentPlanSummary subscription={MOCK_SUBSCRIPTION} />

      <PricingSection
        plans={MOCK_PLANS}
        currentPlanId={MOCK_SUBSCRIPTION.plan_id}
        upgradingPlanId={upgradingPlanId}
        onUpgrade={handleUpgrade}
      />
    </div>
  );
};

export default BillingPlanPage;
