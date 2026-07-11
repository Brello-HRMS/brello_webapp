import { useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { PageHeader } from '../../components/common';
import { OfferWizardLayout } from '../../features/offer-management/components/OfferWizardLayout/OfferWizardLayout';
import { Step1CandidateSelect } from '../../features/offer-management/components/wizard/Step1CandidateSelect';
import { Step2OfferDetails } from '../../features/offer-management/components/wizard/Step2OfferDetails';
import { Step3Compensation } from '../../features/offer-management/components/wizard/Step3Compensation';
import { Step4Policies } from '../../features/offer-management/components/wizard/Step4Policies';
import { Step5Preview } from '../../features/offer-management/components/wizard/Step5Preview';
import {
  useCreateOffer,
  useSendOffer,
  useUpdateOffer,
} from '../../features/offer-management/hooks/useOffers';
import { useOfferCandidate } from '../../features/offer-management/hooks/useOfferCandidates';

import styles from './OfferCreatePage.module.scss';

import type {
  OfferWizardState,
  OfferDetailsParams,
  OfferCompensationParams,
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

  const [state, setState] = useState<OfferWizardState>(() => initState(preselectedCandidateId));
  const [savedOfferId, setSavedOfferId] = useState<string | null>(null);

  const { data: candidateResponse } = useOfferCandidate(state.candidate_id);
  const candidate = candidateResponse?.data ?? null;

  const { mutate: createOffer, isPending: isCreating } = useCreateOffer();
  const { mutate: updateOffer, isPending: isUpdating } = useUpdateOffer();
  const { mutate: sendOffer, isPending: isSending } = useSendOffer();

  const isSaving = isCreating || isUpdating;

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

  const handleSaveDraft = useCallback(() => {
    const payload = {
      candidate_id: state.candidate_id,
      details: state.details,
      compensation: state.compensation,
      policy_ids: state.policy_ids,
    };
    if (savedOfferId) {
      updateOffer(
        { id: savedOfferId, params: payload },
        { onSuccess: () => navigate('/offer-management') },
      );
    } else {
      createOffer(payload, {
        onSuccess: (res) => {
          setSavedOfferId(res.data.id);
          navigate('/offer-management');
        },
      });
    }
  }, [state, savedOfferId, createOffer, updateOffer, navigate]);

  const handleSend = useCallback(() => {
    const payload = {
      candidate_id: state.candidate_id,
      details: state.details,
      compensation: state.compensation,
      policy_ids: state.policy_ids,
    };

    const doSend = (offerId: string) => {
      sendOffer({ id: offerId }, { onSuccess: () => navigate('/offer-management') });
    };

    if (savedOfferId) {
      updateOffer(
        { id: savedOfferId, params: payload },
        {
          onSuccess: () => doSend(savedOfferId),
        },
      );
    } else {
      createOffer(payload, {
        onSuccess: (res) => {
          setSavedOfferId(res.data.id);
          doSend(res.data.id);
        },
      });
    }
  }, [state, savedOfferId, createOffer, updateOffer, sendOffer, navigate]);

  const currentStep = state.step;

  return (
    <div className={styles.page}>
      <PageHeader
        title="Create Offer"
        subtitle="Fill in the details to create and send an offer to a candidate."
      />

      <OfferWizardLayout currentStep={currentStep} title={STEP_TITLES[currentStep - 1]}>
        {currentStep === 1 && (
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
