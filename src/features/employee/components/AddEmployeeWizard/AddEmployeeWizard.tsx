import React from 'react';
import { ChevronLeft } from 'lucide-react';

import { Dialog } from '../../../../components/common';

import { useWizard } from './WizardContext';
import { WizardStepper } from './WizardStepper';
import styles from './AddEmployeeWizard.module.scss';
// Steps imports
import { PersonalInfoStep } from './steps/PersonalInfoStep';
import { EmploymentDetailsStep } from './steps/EmploymentDetailsStep';
import { PayrollStep } from './steps/PayrollStep';
import { DocumentsStep } from './steps/DocumentsStep';
import { SystemAccessStep } from './steps/SystemAccessStep';
import { EducationStep } from './steps/EducationStep';
import { ExperienceStep } from './steps/ExperienceStep';
import { ReviewInviteStep } from './steps/ReviewInviteStep';

const AddEmployeeWizardContent: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { currentStep, prevStep } = useWizard();

  const handleClose = () => {
    onClose();
  };

  const getTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Personal Info';
      case 2:
        return 'Employment Details';
      case 3:
        return 'Payroll & Compensation';
      case 4:
        return 'Documents';
      case 5:
        return 'System Access';
      case 6:
        return 'Education';
      case 7:
        return 'Experience';
      case 8:
        return 'Review & Invite';
      default:
        return 'Add Employee';
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep onClose={handleClose} />;
      case 2:
        return <EmploymentDetailsStep onClose={handleClose} />;
      case 3:
        return <PayrollStep onClose={handleClose} />;
      case 4:
        return <DocumentsStep onClose={handleClose} />;
      case 5:
        return <SystemAccessStep onClose={handleClose} />;
      case 6:
        return <EducationStep onClose={handleClose} />;
      case 7:
        return <ExperienceStep onClose={handleClose} />;
      case 8:
        return <ReviewInviteStep onClose={handleClose} />;
      default:
        return <div>Step {currentStep} Placeholder</div>;
    }
  };

  const wizardTitle = (
    <div className={styles.titleArea}>
      {currentStep > 1 && (
        <button onClick={prevStep} className={styles.backButton}>
          <ChevronLeft size={20} />
        </button>
      )}
      <h2 className={styles.title}>{getTitle()}</h2>
    </div>
  );

  return (
    <Dialog
      title={wizardTitle}
      headerAddon={<WizardStepper currentStep={currentStep} totalSteps={8} />}
      open={true}
      onClose={handleClose}
      maxWidth="600px"
      position="right"
    >
      <div className={styles.stepContent}>{renderStep()}</div>
    </Dialog>
  );
};

export const AddEmployeeWizard: React.FC<{ open: boolean; onClose: () => void }> = ({
  open,
  onClose,
}) => {
  if (!open) return null;

  return <AddEmployeeWizardContent onClose={onClose} />;
};
