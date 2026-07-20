import { FileText, Download, MessageSquareWarning } from 'lucide-react';

import { useOfferVersions } from '../../hooks/useOffers';

import styles from './OfferVersions.module.scss';

const RESPONSE_LABELS: Record<string, string> = {
  accepted: 'Accepted',
  rejected: 'Rejected',
  changes_requested: 'Changes Requested',
};

export const OfferVersions = ({ offerId }: { offerId: string }) => {
  const { data: response, isLoading } = useOfferVersions(offerId);
  const versions = response?.data ?? [];

  if (isLoading) return <div className={styles.loading}>Loading version history...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Version History</h3>
        <p className={styles.subtitle}>
          Track changes and view generated PDFs for each sent offer version.
        </p>
      </div>

      {versions.length === 0 ? (
        <div className={styles.empty}>
          <FileText size={32} className={styles.emptyIcon} />
          <p>No versions have been sent yet.</p>
        </div>
      ) : (
        <div className={styles.timeline}>
          {versions.map((v, index) => (
            <div key={v.id} className={styles.versionCard}>
              <div className={styles.cardHeader}>
                <div className={styles.versionTitle}>
                  Version {v.version_number}
                  {index === 0 && <span className={styles.currentBadge}>Current</span>}
                  {v.candidate_response && (
                    <span className={styles.responseBadge}>
                      {RESPONSE_LABELS[v.candidate_response] ?? v.candidate_response}
                    </span>
                  )}
                </div>
                <div className={styles.date}>{new Date(v.created_at).toLocaleString()}</div>
              </div>

              {v.change_summary && (
                <div className={styles.changeSummary}>
                  <strong>Changes:</strong> {v.change_summary}
                </div>
              )}

              {v.candidate_response === 'changes_requested' && v.negotiation_request && (
                <div className={styles.negotiationRequest}>
                  <div className={styles.negotiationHeader}>
                    <MessageSquareWarning size={14} /> Candidate's Requested Changes
                  </div>
                  {v.negotiation_request.expected_salary != null && (
                    <div className={styles.negotiationRow}>
                      <strong>Expected Salary (Annual):</strong> ₹
                      {Number(v.negotiation_request.expected_salary).toLocaleString('en-IN')}
                    </div>
                  )}
                  {v.negotiation_request.preferred_joining_date && (
                    <div className={styles.negotiationRow}>
                      <strong>Preferred Joining Date:</strong>{' '}
                      {new Date(v.negotiation_request.preferred_joining_date).toLocaleDateString()}
                    </div>
                  )}
                  {v.negotiation_request.comments && (
                    <div className={styles.negotiationRow}>
                      <strong>Comments:</strong> {v.negotiation_request.comments}
                    </div>
                  )}
                  {v.responded_at && (
                    <div className={styles.negotiationMeta}>
                      Requested on {new Date(v.responded_at).toLocaleString()}
                    </div>
                  )}
                </div>
              )}

              <div className={styles.actions}>
                {v.pdf_url ? (
                  <a
                    href={v.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.downloadLink}
                  >
                    <Download size={14} /> View PDF
                  </a>
                ) : (
                  <span className={styles.dim}>No PDF available</span>
                )}
                {v.candidate_response === 'accepted' && v.accepted_pdf_url && (
                  <a
                    href={v.accepted_pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.downloadLink}
                  >
                    <Download size={14} /> View Accepted Copy (Proof)
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
