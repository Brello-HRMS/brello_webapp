import { useCallback, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { PageHeader } from '../../components/common';
import { OfferWizardLayout } from '../../features/offer-management/components/OfferWizardLayout/OfferWizardLayout';
import { Step1CandidateSelect } from '../../features/offer-management/components/wizard/Step1CandidateSelect';
import { Step2OfferDetails } from '../../features/offer-management/components/wizard/Step2OfferDetails';
import { Step3Compensation } from '../../features/offer-management/components/wizard/Step3Compensation';
import { Step4Policies } from '../../features/offer-management/components/wizard/Step4Policies';
import { Step5Preview } from '../../features/offer-management/components/wizard/Step5Preview';
import {
  useOffer,
  useCreateOffer,
  useSendOffer,
  useUpdateOffer,
} from '../../features/offer-management/hooks/useOffers';
import { useOfferCandidate } from '../../features/offer-management/hooks/useOfferCandidates';

import type {
  OfferWizardState,
  OfferDetailsParams,
  OfferCompensationParams,
  UpdateOfferParams,
} from '../../features/offer-management/types/offerTypes';

const STEP_TITLES = [
  'Select Candidate',
  'Offer Details',
  'Compensation',
  'Policies',
  'Preview & Send',
];

const initState = (candidateId: string): OfferWizardState => ({
  step: candidateId ? 2 : 1,
  candidate_id: candidateId,
  details: {},
  compensation: { salary_components: [] },
  policy_ids: [],
});

const OfferCreatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCandidateId = searchParams.get('candidate_id') ?? '';
  const { id: editOfferId } = useParams<{ id: string }>();
  const isEditMode = !!editOfferId;

  const [state, setState] = useState<OfferWizardState>(() => initState(preselectedCandidateId));
  // In edit mode this is the offer we're revising, set as soon as we know it — never created
  // fresh. In create mode it starts null and is filled in once the first draft save succeeds.
  const [savedOfferId, setSavedOfferId] = useState<string | null>(editOfferId ?? null);
  const [hasHydratedEdit, setHasHydratedEdit] = useState(false);

  const { data: editOfferResponse, isLoading: isLoadingEditOffer } = useOffer(editOfferId ?? '');
  const editOffer = editOfferResponse?.data;

  const { data: candidateResponse } = useOfferCandidate(state.candidate_id);
  const candidate = candidateResponse?.data ?? null;

  const { mutate: createOffer, isPending: isCreating } = useCreateOffer();
  const { mutate: updateOffer, isPending: isUpdating } = useUpdateOffer();
  const { mutate: sendOffer, isPending: isSending } = useSendOffer();

  const isSaving = isCreating || isUpdating;

  // Hydrate wizard state from the existing offer once, when editing.
  if (isEditMode && editOffer && !hasHydratedEdit) {
    setHasHydratedEdit(true);

    setState({
      step: 2,
      candidate_id: editOffer.candidate_id,
      template_id: editOffer.template_id ?? undefined,
      details: {
        position: editOffer.position ?? undefined,
        department_id: editOffer.department_id ?? undefined,
        designation_id: editOffer.designation_id ?? undefined,
        employment_type: editOffer.employment_type ?? undefined,
        joining_date: editOffer.joining_date ?? undefined,
        reporting_manager_id: editOffer.reporting_manager_id ?? undefined,
        work_mode: editOffer.work_mode ?? undefined,
        work_location: editOffer.work_location ?? undefined,
        office_address: editOffer.office_address ?? undefined,
        probation_days: editOffer.probation_days ?? undefined,
        notice_period_days: editOffer.notice_period_days ?? undefined,
      },
      compensation: {
        salary_structure_id: editOffer.salary_structure_id ?? undefined,
        ctc_annual: editOffer.ctc_annual ?? undefined,
        monthly_take_home: editOffer.monthly_take_home ?? undefined,
        salary_components: editOffer.salary_components ?? [],
      },
      policy_ids: editOffer.policy_ids ?? [],
    });
  }

  const goTo = (step: number) => setState((s) => ({ ...s, step }));

  const handleSelectCandidate = useCallback((candidateId: string) => {
    setState((s) => ({ ...s, candidate_id: candidateId }));
  }, []);

  const handleStep2 = useCallback((details: OfferDetailsParams) => {
    setState((s) => ({ ...s, details, step: 3 }));
  }, []);

  const handleStep3 = useCallback((compensation: OfferCompensationParams) => {
    setState((s) => ({ ...s, compensation, step: 4 }));
  }, []);

  const handleStep4 = useCallback((policy_ids: string[]) => {
    setState((s) => ({ ...s, policy_ids, step: 5 }));
  }, []);

  // UpdateOfferDto (backend) has no candidate_id field — the global ValidationPipe
  // (forbidNonWhitelisted: true) rejects the whole request if it's present, so the
  // update payload must never include it, unlike the create payload.
  const buildUpdatePayload = useCallback(
    (): UpdateOfferParams => ({
      template_id: state.template_id,
      details: state.details,
      compensation: state.compensation,
      policy_ids: state.policy_ids,
    }),
    [state],
  );

  const afterMutation = useCallback(
    (offerId: string) => navigate(`/offer-management/offers/${offerId}`),
    [navigate],
  );

  const handleSaveDraft = useCallback(() => {
    if (savedOfferId) {
      updateOffer(
        { id: savedOfferId, params: buildUpdatePayload() },
        { onSuccess: () => afterMutation(savedOfferId) },
      );
    } else {
      createOffer(
        {
          candidate_id: state.candidate_id,
          details: state.details,
          compensation: state.compensation,
          policy_ids: state.policy_ids,
        },
        {
          onSuccess: (res) => {
            setSavedOfferId(res.data.id);
            afterMutation(res.data.id);
          },
        },
      );
    }
  }, [state, savedOfferId, createOffer, updateOffer, buildUpdatePayload, afterMutation]);

  const handleSend = useCallback(() => {
    const doSend = (offerId: string) => {
      sendOffer({ id: offerId }, { onSuccess: () => afterMutation(offerId) });
    };

    if (savedOfferId) {
      updateOffer(
        { id: savedOfferId, params: buildUpdatePayload() },
        { onSuccess: () => doSend(savedOfferId) },
      );
    } else {
      createOffer(
        {
          candidate_id: state.candidate_id,
          details: state.details,
          compensation: state.compensation,
          policy_ids: state.policy_ids,
        },
        {
          onSuccess: (res) => {
            setSavedOfferId(res.data.id);
            doSend(res.data.id);
          },
        },
      );
    }
  }, [state, savedOfferId, createOffer, updateOffer, sendOffer, buildUpdatePayload, afterMutation]);

  if (isEditMode && isLoadingEditOffer) {
    return <div>Loading offer...</div>;
  }

  const currentStep = state.step;

  return (
    <div>
      <PageHeader
        title={isEditMode ? 'Edit Offer' : 'Create Offer'}
        subtitle={
          isEditMode
            ? 'Revise the offer details and resend a new version to the candidate.'
            : 'Fill in the details to create and send an offer to a candidate.'
        }
      />

      <OfferWizardLayout currentStep={currentStep} title={STEP_TITLES[currentStep - 1]}>
        {currentStep === 1 && !isEditMode && (
          <Step1CandidateSelect
            selectedCandidateId={state.candidate_id}
            onSelect={handleSelectCandidate}
            onNext={() => goTo(2)}
          />
        )}
        {currentStep === 2 && (
          <Step2OfferDetails
            defaultValues={state.details}
            onBack={() => goTo(1)}
            onNext={handleStep2}
          />
        )}
        {currentStep === 3 && (
          <Step3Compensation
            defaultValues={state.compensation}
            onBack={() => goTo(2)}
            onNext={handleStep3}
          />
        )}
        {currentStep === 4 && (
          <Step4Policies
            selectedPolicyIds={state.policy_ids}
            onBack={() => goTo(3)}
            onNext={handleStep4}
          />
        )}
        {currentStep === 5 && (
          <Step5Preview
            wizardState={state}
            candidate={candidate}
            isSaving={isSaving}
            isSending={isSending}
            onBack={() => goTo(4)}
            onSaveDraft={handleSaveDraft}
            onSend={handleSend}
          />
        )}
      </OfferWizardLayout>
    </div>
  );
};

export default OfferCreatePage;
