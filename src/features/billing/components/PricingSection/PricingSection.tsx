import React from 'react';
import { Zap, Crown } from 'lucide-react';

import { PlanCard } from '../PlanCard/PlanCard';

import styles from './PricingSection.module.scss';

import type { OrgPlan } from '../../types';

const PLAN_ICON_MAP: Record<string, { icon: typeof Zap; iconColor: string }> = {
  standard: { icon: Zap, iconColor: '#22c55e' },
  premium: { icon: Crown, iconColor: '#f59e0b' },
};

interface PricingSectionProps {
  plans: OrgPlan[];
  currentPlanId: string;
  upgradingPlanId: string | null;
  onUpgrade: (planId: string) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  plans,
  currentPlanId,
  upgradingPlanId,
  onUpgrade,
}) => {
  return (
    <div className={styles.section}>
      <div className={styles.heading}>
        <span className={styles.tag}>#PRICING</span>
        <h2 className={styles.title}>Flexible Pricing For Every Organisation</h2>
      </div>

      <div className={styles.plansGrid}>
        {plans.map((plan) => {
          const iconConfig = PLAN_ICON_MAP[plan.tier] ?? PLAN_ICON_MAP.standard;
          return (
            <PlanCard
              key={plan.id}
              plan={plan}
              icon={iconConfig.icon}
              iconColor={iconConfig.iconColor}
              isCurrentPlan={plan.id === currentPlanId}
              isUpgrading={upgradingPlanId === plan.id}
              onUpgrade={onUpgrade}
            />
          );
        })}
      </div>
    </div>
  );
};
