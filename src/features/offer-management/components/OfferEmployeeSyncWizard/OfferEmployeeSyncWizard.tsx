import { AddEmployeeWizard } from '../../../employee/components/AddEmployeeWizard/AddEmployeeWizard';
import { WizardProvider } from '../../../employee/components/AddEmployeeWizard/WizardContext';
import { useLinkEmployeeToOffer } from '../../hooks/useOffers';

import type { Offer, OfferCandidate } from '../../types/offerTypes';

/**
 * Maps an accepted Offer + its Candidate into the Add Employee wizard's formData shape
 * (see AddEmployeeWizard.tsx's mapEmployeeToFormData for the edit-mode equivalent). Only
 * fields with a clean, unambiguous source on the offer are prefilled — everything else
 * (bank details, PAN/UAN, documents, education, experience, probation period, DOB, address)
 * is intentionally left for HR to fill in through the wizard's normal steps, since the offer
 * never captured them.
 *
 * Deliberately NOT prefilled: `email`. The candidate record holds the personal email they
 * applied with, not their official company email/login — HR must type that in fresh.
 */
function mapOfferToWizardPrefill(offer: Offer, candidate: OfferCandidate) {
  return {
    firstName: candidate.first_name || '',
    lastName: candidate.last_name || '',
    phone: candidate.phone || '',

    departmentId: offer.department_id || '',
    designationId: offer.designation_id || '',
    reportsTo: offer.reporting_manager_id || '',
    employmentDate: offer.joining_date || '',
    joiningDate: offer.joining_date || '',
    workLocation: offer.work_mode || '',
  };
}

/**
 * Name is locked because it must match the accepted offer/candidate identity — HR shouldn't
 * be able to silently rename the person being onboarded mid-sync. Compensation isn't in this
 * list because there's no salary/CTC field in this wizard at all (see PayrollStep — it only
 * captures bank/PAN/tax info); the offer's negotiated CTC is applied server-side once the
 * employee is created (OfferSyncService.linkEmployeeAndAssignSalary), not through this UI.
 */
const OFFER_SYNC_LOCKED_FIELDS = ['firstName', 'lastName'];

interface OfferEmployeeSyncWizardProps {
  open: boolean;
  offer: Offer;
  candidate: OfferCandidate;
  onClose: () => void;
}

const OfferEmployeeSyncWizardContent = ({
  offer,
  candidate,
  onClose,
}: Omit<OfferEmployeeSyncWizardProps, 'open'>) => {
  const { mutate: linkEmployee } = useLinkEmployeeToOffer();

  const handleEmployeeCreated = (employeeId: string) => {
    linkEmployee({ id: offer.id, employeeId });
  };

  return (
    <AddEmployeeWizard
      open
      onClose={onClose}
      prefillData={mapOfferToWizardPrefill(offer, candidate)}
      lockedFields={OFFER_SYNC_LOCKED_FIELDS}
      onEmployeeCreated={handleEmployeeCreated}
    />
  );
};

export const OfferEmployeeSyncWizard = ({
  open,
  offer,
  candidate,
  onClose,
}: OfferEmployeeSyncWizardProps) => {
  if (!open) return null;

  return (
    <WizardProvider>
      <OfferEmployeeSyncWizardContent offer={offer} candidate={candidate} onClose={onClose} />
    </WizardProvider>
  );
};
