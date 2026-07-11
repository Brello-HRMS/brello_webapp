import { useMemo } from 'react';

import { Button } from '../../../../components/common';
import { useOfferCandidates } from '../../hooks/useOfferCandidates';

import styles from './WizardStep.module.scss';

import type { OfferCandidate } from '../../types/offerTypes';

interface Props {
  selectedCandidateId: string;
  onSelect: (candidateId: string) => void;
  onNext: () => void;
}

export const Step1CandidateSelect = ({ selectedCandidateId, onSelect, onNext }: Props) => {
  const { data: response, isLoading } = useOfferCandidates();
  const candidates = useMemo(() => response?.data ?? [], [response]);

  return (
    <div className={styles.stepBody}>
      <p className={styles.hint}>
        Select the candidate you want to create an offer for. Only candidates without an active
        offer are listed below.
      </p>

      {isLoading ? (
        <div className={styles.loading}>Loading candidates...</div>
      ) : candidates.length === 0 ? (
        <div className={styles.empty}>No candidates available. Add a candidate first.</div>
      ) : (
        <div className={styles.candidateGrid}>
          {candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              isSelected={selectedCandidateId === candidate.id}
              onSelect={() => onSelect(candidate.id)}
            />
          ))}
        </div>
      )}

      <div className={styles.footer}>
        <Button variant="primary" onClick={onNext} disabled={!selectedCandidateId}>
          Next: Offer Details →
        </Button>
      </div>
    </div>
  );
};

const CandidateCard = ({
  candidate,
  isSelected,
  onSelect,
}: {
  candidate: OfferCandidate;
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    className={`${styles.candidateCard} ${isSelected ? styles.selected : ''}`}
    onClick={onSelect}
  >
    <div className={styles.avatar}>
      {candidate.first_name[0]}
      {candidate.last_name[0]}
    </div>
    <div className={styles.candidateInfo}>
      <span className={styles.candidateName}>
        {candidate.first_name} {candidate.last_name}
      </span>
      <span className={styles.candidateEmail}>{candidate.email}</span>
      {candidate.applied_for && <span className={styles.appliedFor}>{candidate.applied_for}</span>}
    </div>
    {isSelected && <span className={styles.selectedDot} />}
  </button>
);
