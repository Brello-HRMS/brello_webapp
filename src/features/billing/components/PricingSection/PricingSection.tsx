import React from 'react';
import { Zap, Crown } from 'lucide-react';

import { PlanCard } from '../PlanCard/PlanCard';
import { BillingCycleToggle } from '../BillingCycleToggle/BillingCycleToggle';

import styles from './PricingSection.module.scss';

import type { PlanData, BillingCycle } from '../../types';

const PLAN_ICON_MAP: Record<string, { icon: typeof Zap; iconColor: string }> = {
  standard: { icon: Zap, iconColor: '#22c55e' },
  premium: { icon: Crown, iconColor: '#f59e0b' },
};

interface PricingSectionProps {
  plans: PlanData[];
  changingPlanId: string | null;
  onChangePlan: (planId: string) => void;
  billingCycle: BillingCycle;
  onCycleChange: (cycle: BillingCycle) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  plans,
  changingPlanId,
  onChangePlan,
  billingCycle,
  onCycleChange,
}) => {
  return (
    <div className={styles.section}>
      <div className={styles.heading}>
        <span className={styles.tag}>#PRICING</span>
        <h2 className={styles.title}>Flexible Pricing For Every Organisation</h2>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
        <BillingCycleToggle value={billingCycle} onChange={onCycleChange} />
      </div>

      <div className={styles.plansGrid}>
        {plans.map((plan) => {
          const planKey = plan.name?.toLowerCase() || 'standard';
          const iconConfig = PLAN_ICON_MAP[planKey] ?? PLAN_ICON_MAP.standard;
          return (
            <PlanCard
              key={plan.id}
              plan={plan}
              icon={iconConfig.icon}
              iconColor={iconConfig.iconColor}
              isChanging={changingPlanId === plan.id}
              onChangePlan={onChangePlan}
              billingCycle={billingCycle}
            />
          );
        })}
      </div>
    </div>
  );
};
