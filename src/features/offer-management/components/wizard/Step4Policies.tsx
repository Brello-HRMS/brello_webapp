import { useMemo, useState } from 'react';

import { Button } from '../../../../components/common';
import { useGroupedPolicies } from '../../../policies/hooks/useGroupedPolicies';

import styles from './WizardStep.module.scss';

interface Policy {
  id: string;
  name: string;
  description?: string;
}

interface Props {
  selectedPolicyIds: string[];
  onBack: () => void;
  onNext: (policyIds: string[]) => void;
}

export const Step4Policies = ({ selectedPolicyIds, onBack, onNext }: Props) => {
  const [selected, setSelected] = useState<string[]>(selectedPolicyIds);
  const { data: policyGroups, isLoading } = useGroupedPolicies();

  const policyList = useMemo<Policy[]>(
    () =>
      (policyGroups ?? []).flatMap((group) =>
        group.policies.map((policy) => ({
          id: policy.id,
          name: policy.title,
          description: policy.description,
        })),
      ),
    [policyGroups],
  );

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  return (
    <div className={styles.stepBody}>
      <p className={styles.hint}>
        Select the company policies to include in the offer letter. Candidates will receive these as
        part of their offer documentation.
      </p>

      {isLoading ? (
        <p className={styles.hint}>Loading policies...</p>
      ) : policyList.length === 0 ? (
        <p className={styles.hint}>No company policies have been configured yet.</p>
      ) : (
        <div className={styles.policyGrid}>
          {policyList.map((policy) => {
            const isChecked = selected.includes(policy.id);
            return (
              <button
                key={policy.id}
                type="button"
                className={`${styles.policyCard} ${isChecked ? styles.policySelected : ''}`}
                onClick={() => toggle(policy.id)}
              >
                <div className={styles.policyCheck}>
                  {isChecked && <span className={styles.checkmark}>✓</span>}
                </div>
                <div className={styles.policyInfo}>
                  <span className={styles.policyName}>{policy.name}</span>
                  {policy.description && (
                    <span className={styles.policyDesc}>{policy.description}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className={styles.footer}>
        <Button variant="ghost" type="button" onClick={onBack}>
          ← Back
        </Button>
        <Button variant="primary" onClick={() => onNext(selected)}>
          Next: Preview & Send →
        </Button>
      </div>
    </div>
  );
};
