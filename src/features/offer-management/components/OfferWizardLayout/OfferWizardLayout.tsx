import React from 'react';
import { Check } from 'lucide-react';

import styles from './OfferWizardLayout.module.scss';

const STEPS = [
  { id: 1, label: 'Candidate' },
  { id: 2, label: 'Offer Details' },
  { id: 3, label: 'Compensation' },
  { id: 4, label: 'Policies' },
  { id: 5, label: 'Preview & Send' },
];

interface Props {
  currentStep: number;
  children: React.ReactNode;
  title?: string;
}

export const OfferWizardLayout = ({ currentStep, children, title }: Props) => (
  <div className={styles.wrapper}>
    {/* Stepper */}
    <div className={styles.stepper}>
      {STEPS.map((step, index) => {
        const isDone = step.id < currentStep;
        const isActive = step.id === currentStep;
        return (
          <React.Fragment key={step.id}>
            <div
              className={`${styles.step} ${isActive ? styles.active : ''} ${isDone ? styles.done : ''}`}
            >
              <div className={styles.circle}>{isDone ? <Check size={14} /> : step.id}</div>
              <span className={styles.stepLabel}>{step.label}</span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={`${styles.connector} ${isDone ? styles.connectorDone : ''}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>

    {/* Content */}
    <div className={styles.content}>
      {title && <h2 className={styles.stepTitle}>{title}</h2>}
      {children}
    </div>
  </div>
);
