/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { ChevronLeft, Loader2 } from 'lucide-react';

import { Dialog } from '../../../../components/common';
import { useEmployeeDetail } from '../../hooks/useEmployeeDetail';

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

/**
 * Maps the GET /employees/:id response into the wizard's flat formData shape.
 */
function mapEmployeeToFormData(employee: any): any {
  const profile = employee.profile || {};
  const bankInfo = employee.bankInfo || {};
  const govInfo = employee.govInfo || {};

  return {
    firstName: employee.firstName || '',
    lastName: employee.lastName || '',
    email: employee.email || '',
    phone: employee.phone || '',
    dob: profile.dob || '',
    address: profile.address || '',
    emergencyContact: '',
    avatar: null,

    // Employment
    departmentId: employee.departmentId || '',
    designationId: employee.designationId || '',
    reportsTo: employee.reportsTo || '',
    employmentDate: profile.employmentDate || '',
    joiningDate: profile.joiningDate || '',
    workLocation: profile.workModel || profile.workLocation || '',
    probationPeriod: profile.probationPeriod || '',
    notes: profile.notes || '',

    // Payroll
    taxRegime: profile.taxRegime || govInfo.tax_regime || 'NEW',
    pan: govInfo.pan || '',
    uan: govInfo.uan || '',
    accountNumber: bankInfo.account_number || '',
    bankName: bankInfo.bank_name || '',
    ifscCode: bankInfo.ifsc_code || '',

    // Education & Experience (arrays for listing)
    education: employee.education || [],
    experience: employee.experience || [],

    // Documents
    documents: employee.documents || [],

    // Assets
    assets: employee.assets || [],
  };
}

interface WizardContentProps {
  onClose: () => void;
  editEmployeeId?: string;
}

const AddEmployeeWizardContent: React.FC<WizardContentProps> = ({ onClose, editEmployeeId }) => {
  const { currentStep, prevStep, isEditMode, initEditMode } = useWizard();
  const isEditIntent = !!editEmployeeId;

  // Fetch employee data when in edit mode
  const { data: employeeResponse, isLoading: isLoadingEmployee } = useEmployeeDetail(
    isEditIntent ? editEmployeeId : undefined,
  );

  // Initialize edit mode once data arrives
  const hasInitialized = React.useRef(false);
  React.useEffect(() => {
    if (isEditIntent && employeeResponse && !hasInitialized.current) {
      const employee = (employeeResponse as any)?.data || employeeResponse;
      const prefill = mapEmployeeToFormData(employee);
      initEditMode(editEmployeeId!, prefill);
      hasInitialized.current = true;
    }
  }, [isEditIntent, employeeResponse, editEmployeeId, initEditMode]);

  // Reset ref when dialog closes/reopens
  React.useEffect(() => {
    return () => {
      hasInitialized.current = false;
    };
  }, []);

  const handleClose = () => {
    onClose();
  };

  // Show a loading state while fetching employee data for edit
  if (isEditIntent && isLoadingEmployee) {
    return (
      <Dialog
        title="Loading Employee..."
        open={true}
        onClose={handleClose}
        maxWidth="600px"
        position="right"
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '300px',
          }}
        >
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      </Dialog>
    );
  }

  const getTitle = () => {
    const prefix = isEditMode ? 'Edit' : '';
    switch (currentStep) {
      case 1:
        return `${prefix} Personal Info`.trim();
      case 2:
        return `${prefix} Employment Details`.trim();
      case 3:
        return `${prefix} Payroll & Compensation`.trim();
      case 4:
        return `${prefix} Documents`.trim();
      case 5:
        return `${prefix} System Access`.trim();
      case 6:
        return `${prefix} Education`.trim();
      case 7:
        return `${prefix} Experience`.trim();
      case 8:
        return isEditMode ? 'Review Changes' : 'Review & Invite';
      default:
        return isEditMode ? 'Edit Employee' : 'Add Employee';
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

interface AddEmployeeWizardProps {
  open: boolean;
  onClose: () => void;
  editEmployeeId?: string;
}

export const AddEmployeeWizard: React.FC<AddEmployeeWizardProps> = ({
  open,
  onClose,
  editEmployeeId,
}) => {
  if (!open) return null;

  return <AddEmployeeWizardContent onClose={onClose} editEmployeeId={editEmployeeId} />;
};
