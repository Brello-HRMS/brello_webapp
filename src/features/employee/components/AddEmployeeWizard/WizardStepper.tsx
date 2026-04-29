import React from 'react';

import styles from './WizardStepper.module.scss';

interface WizardStepperProps {
  currentStep: number;
  totalSteps: number;
}

export const WizardStepper: React.FC<WizardStepperProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className={styles.stepperContainer}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber <= currentStep;

        return (
          <div
            key={stepNumber}
            className={`${styles.stepSegment} ${isActive ? styles.active : ''}`}
          />
        );
      })}
    </div>
  );
};
