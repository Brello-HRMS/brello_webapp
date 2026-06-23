import React, { useState } from 'react';
import { Check, type LucideIcon } from 'lucide-react';

import { Button } from '../../../../components/ui/Button/Button';

import styles from './PlanCard.module.scss';

import type { PlanData, BillingCycle } from '../../types';

type PlanCta = PlanData['cta'];

const CTA_VARIANT: Record<PlanCta, 'primary' | 'secondary' | 'outline'> = {
  'Current Plan': 'secondary',
  'Upgrade Now': 'primary',
  'Downgrade Next Cycle': 'outline',
  'Switch to Annual': 'outline',
  'Switch to Monthly': 'outline',
  'Choose Plan': 'primary',
};

interface PlanCardProps {
  plan: PlanData;
  icon: LucideIcon;
  iconColor: string;
  isChanging: boolean;
  onChangePlan: (planId: string) => void;
  billingCycle: BillingCycle;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  icon: Icon,
  iconColor,
  isChanging,
  onChangePlan,
  billingCycle,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isYearly = billingCycle === 'Annual';
  const isCurrentPlan = plan.is_current && plan.is_current_cycle;
  const cta = plan.cta as PlanCta;
  const isDisabled = cta === 'Current Plan';

  return (
    <div
      className={`${styles.card} ${isHovered && !isCurrentPlan ? styles.hovered : ''} ${isCurrentPlan ? styles.current : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.body}>
        <div className={styles.header}>
          <Icon size={20} color={iconColor} />
          <h3 className={styles.planName}>{plan.name}</h3>
        </div>
        <p className={styles.description}>{plan.description}</p>

        <div className={styles.pricing}>
          <span className={styles.price}>
            ₹{isYearly ? plan.price_per_employee_annual : plan.price_per_employee_monthly}
          </span>
          <span className={styles.priceSuffix}> /employee /{isYearly ? 'yr' : 'mo'}</span>
        </div>

        <div className={styles.trialBadge}>30 day free trial</div>

        <Button
          variant={isHovered && !isDisabled ? 'primary' : CTA_VARIANT[cta]}
          isLoading={isChanging}
          disabled={isDisabled || isChanging}
          onClick={() => !isDisabled && onChangePlan(plan.id)}
          className={styles.actionBtn}
        >
          {cta}
        </Button>

        <ul className={styles.featureList}>
          {plan.feature?.map((feature) => (
            <li key={feature} className={styles.featureItem}>
              <Check size={14} className={styles.checkIcon} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
