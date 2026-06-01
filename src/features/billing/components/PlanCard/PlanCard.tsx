import React, { useState } from 'react';
import { Check, Zap, type LucideIcon } from 'lucide-react';

import { Button } from '../../../../components/common/Button/Button';

import styles from './PlanCard.module.scss';

import type { OrgPlan } from '../../types';

interface PlanCardProps {
  plan: OrgPlan;
  icon: LucideIcon;
  iconColor: string;
  isCurrentPlan: boolean;
  isUpgrading: boolean;
  onUpgrade: (planId: string) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  icon: Icon,
  iconColor,
  isCurrentPlan,
  isUpgrading,
  onUpgrade,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`${styles.card} ${isHovered && !isCurrentPlan ? styles.hovered : ''} ${isCurrentPlan ? styles.current : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && !isCurrentPlan && (
        <div className={styles.taglineBanner}>
          <span>{plan.tagline}</span>
        </div>
      )}

      <div className={styles.body}>
        <div className={styles.header}>
          <Icon size={20} color={iconColor} />
          <h3 className={styles.planName}>{plan.name}</h3>
        </div>
        <p className={styles.description}>{plan.description}</p>

        <div className={styles.pricing}>
          <span className={styles.price}>₹{plan.price_per_employee}</span>
          <span className={styles.priceSuffix}> /employee /mo</span>
        </div>

        <div className={styles.trialBadge}>{plan.trial_days} day free trial</div>

        {isCurrentPlan ? (
          <Button variant="secondary" disabled className={styles.actionBtn}>
            Current Plan
          </Button>
        ) : (
          <Button
            variant={isHovered ? 'primary' : 'outline'}
            isLoading={isUpgrading}
            onClick={() => onUpgrade(plan.id)}
            className={styles.actionBtn}
          >
            <Zap size={14} /> Upgrade
          </Button>
        )}

        <ul className={styles.featureList}>
          {plan.features.map((feature) => (
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
