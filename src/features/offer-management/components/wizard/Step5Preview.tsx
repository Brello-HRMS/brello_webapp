import { useState } from 'react';
import { Send, FileText, AlertCircle } from 'lucide-react';

import { Button } from '../../../../components/common';

import styles from './WizardStep.module.scss';

import type { OfferWizardState, OfferCandidate } from '../../types/offerTypes';

interface Props {
  wizardState: OfferWizardState;
  candidate: OfferCandidate | null;
  isSaving: boolean;
  isSending: boolean;
  onBack: () => void;
  onSaveDraft: () => void;
  onSend: () => void;
}

export const Step5Preview = ({
  wizardState,
  candidate,
  isSaving,
  isSending,
  onBack,
  onSaveDraft,
  onSend,
}: Props) => {
  const [sendConfirmed, setSendConfirmed] = useState(false);
  const { details, compensation } = wizardState;

  return (
    <div className={styles.stepBody}>
      <div className={styles.previewCard}>
        <div className={styles.previewSection}>
          <h3 className={styles.previewSectionTitle}>Candidate</h3>
          {candidate ? (
            <div className={styles.previewRow}>
              <span>
                {candidate.first_name} {candidate.last_name}
              </span>
              <span className={styles.secondary}>{candidate.email}</span>
            </div>
          ) : (
            <span className={styles.secondary}>—</span>
          )}
        </div>

        <div className={styles.previewSection}>
          <h3 className={styles.previewSectionTitle}>Offer Details</h3>
          <table className={styles.previewTable}>
            <tbody>
              <PreviewRow label="Position" value={details.position} />
              <PreviewRow
                label="Employment Type"
                value={details.employment_type?.replace('_', ' ')}
              />
              <PreviewRow label="Joining Date" value={details.joining_date} />
              <PreviewRow label="Work Mode" value={details.work_mode} />
              <PreviewRow label="Location" value={details.work_location} />
              <PreviewRow
                label="Probation"
                value={details.probation_days ? `${details.probation_days} days` : undefined}
              />
              <PreviewRow
                label="Notice Period"
                value={
                  details.notice_period_days ? `${details.notice_period_days} days` : undefined
                }
              />
            </tbody>
          </table>
        </div>

        <div className={styles.previewSection}>
          <h3 className={styles.previewSectionTitle}>Compensation</h3>
          <table className={styles.previewTable}>
            <tbody>
              <PreviewRow
                label="Annual CTC"
                value={
                  compensation.ctc_annual
                    ? `₹${Number(compensation.ctc_annual).toLocaleString('en-IN')}`
                    : undefined
                }
              />
              <PreviewRow
                label="Monthly Take-Home"
                value={
                  compensation.monthly_take_home
                    ? `₹${Number(compensation.monthly_take_home).toLocaleString('en-IN')}`
                    : undefined
                }
              />
            </tbody>
          </table>

          {compensation.salary_components && compensation.salary_components.length > 0 && (
            <table className={styles.componentsTable}>
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Type</th>
                  <th className={styles.right}>Monthly</th>
                  <th className={styles.right}>Annual</th>
                </tr>
              </thead>
              <tbody>
                {compensation.salary_components.map((c, i) => (
                  <tr key={i}>
                    <td>{c.name}</td>
                    <td className={styles.secondary}>{c.type}</td>
                    <td className={styles.right}>
                      ₹{Math.round(c.amount / 12).toLocaleString('en-IN')}
                    </td>
                    <td className={styles.right}>₹{c.amount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {wizardState.policy_ids.length > 0 && (
          <div className={styles.previewSection}>
            <h3 className={styles.previewSectionTitle}>
              Policies ({wizardState.policy_ids.length} selected)
            </h3>
          </div>
        )}
      </div>

      <div className={styles.sendConfirm}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={sendConfirmed}
            onChange={(e) => setSendConfirmed(e.target.checked)}
          />
          <span>
            I confirm all offer details are correct and the candidate will receive this offer by
            email.
          </span>
        </label>
      </div>

      {!details.position && (
        <div className={styles.warning}>
          <AlertCircle size={14} />
          Position is not filled — the offer will be sent without a role title.
        </div>
      )}

      <div className={styles.footer}>
        <Button variant="ghost" type="button" onClick={onBack}>
          ← Back
        </Button>
        <Button variant="outline" onClick={onSaveDraft} disabled={isSaving}>
          <FileText size={15} />
          {isSaving ? 'Saving...' : 'Save as Draft'}
        </Button>
        <Button variant="primary" onClick={onSend} disabled={!sendConfirmed || isSending}>
          <Send size={15} />
          {isSending ? 'Sending...' : 'Send Offer'}
        </Button>
      </div>
    </div>
  );
};

const PreviewRow = ({ label, value }: { label: string; value?: string | null }) => (
  <tr>
    <td className={styles.previewLabel}>{label}</td>
    <td>{value ?? <span className={styles.secondary}>—</span>}</td>
  </tr>
);
