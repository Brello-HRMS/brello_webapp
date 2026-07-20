import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CheckCircle, XCircle, MessageSquare, FileText, Loader2, Download } from 'lucide-react';

import {
  getPortalOffer,
  acceptOffer,
  rejectOffer,
  requestOfferChanges,
} from '../../features/offer-management/api/offerPortal.api';

import { OnboardingDocumentUpload } from './OnboardingDocumentUpload';
import styles from './OfferPortalPage.module.scss';

import type {
  OfferPortalData,
  OfferPortalPolicy,
} from '../../features/offer-management/types/offerTypes';

type PortalView = 'offer' | 'accept_confirm' | 'reject_form' | 'negotiate_form' | 'done';
type DoneOutcome = 'accepted' | 'rejected' | 'negotiated';

const OfferPortalPage = () => {
  const { token } = useParams<{ token: string }>();
  const [view, setView] = useState<PortalView>('offer');
  const [rejectReason, setRejectReason] = useState('');
  const [negotiateComment, setNegotiateComment] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [doneOutcome, setDoneOutcome] = useState<DoneOutcome>('accepted');
  const [acceptedPdfUrl, setAcceptedPdfUrl] = useState<string | null>(null);

  const handleDownloadPolicy = (policy: OfferPortalPolicy) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${policy.title}</title>
          <style>
            body { font-family: system-ui, sans-serif; line-height: 1.6; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; }
            h1 { color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h1>${policy.title}</h1>
          <div>${policy.content || 'No content available.'}</div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['portal-offer', token],
    queryFn: () => getPortalOffer(token!),
    enabled: !!token,
    retry: false,
  });

  const { mutate: doAccept, isPending: isAccepting } = useMutation({
    mutationFn: () => acceptOffer(token!),
    onSuccess: (response) => {
      setAcceptedPdfUrl(response.data?.accepted_pdf_url ?? null);
      setDoneOutcome('accepted');
      setView('done');
    },
  });

  const { mutate: doReject, isPending: isRejecting } = useMutation({
    mutationFn: () => rejectOffer(token!, rejectReason),
    onSuccess: () => {
      setDoneOutcome('rejected');
      setView('done');
    },
  });

  const { mutate: doNegotiate, isPending: isNegotiating } = useMutation({
    mutationFn: () =>
      requestOfferChanges(token!, {
        expected_salary: expectedSalary ? parseFloat(expectedSalary) : undefined,
        comments: negotiateComment,
      }),
    onSuccess: () => {
      setDoneOutcome('negotiated');
      setView('done');
    },
  });

  if (isLoading) {
    return (
      <div className={styles.shell}>
        <div className={styles.centerScreen}>
          <Loader2 size={28} className={styles.spinner} />
          <p>Loading your offer...</p>
        </div>
      </div>
    );
  }

  if (error || !response?.data) {
    return (
      <div className={styles.shell}>
        <div className={styles.centerScreen}>
          <div className={styles.errorCard}>
            <XCircle size={40} className={styles.errorIcon} />
            <h2>Offer Not Found</h2>
            <p>
              This offer link is invalid or has expired. Please contact HR if you think this is a
              mistake.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { offer, version, candidate, policies } = response.data as OfferPortalData;
  const candidateName = `${candidate.first_name} ${candidate.last_name}`;

  const isClosed = ['ACCEPTED', 'REJECTED', 'WITHDRAWN', 'EXPIRED', 'SYNCED'].includes(
    offer.offer_status,
  );

  const DONE_CONTENT: Record<
    DoneOutcome,
    { icon: React.ReactNode; iconClass: string; message: string }
  > = {
    accepted: {
      icon: <CheckCircle size={52} />,
      iconClass: styles.doneIconAccept,
      message: '🎉 You have accepted the offer! We will be in touch with the next steps.',
    },
    rejected: {
      icon: <XCircle size={52} />,
      iconClass: styles.doneIconReject,
      message: 'Thank you for letting us know. We wish you all the best in your future endeavours.',
    },
    negotiated: {
      icon: <MessageSquare size={52} />,
      iconClass: styles.doneIconNegotiate,
      message: 'Your request has been sent to the HR team. They will review and respond shortly.',
    },
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.documentContainer}>
        <header className={styles.letterhead}>
          <div className={styles.brand}>
            <span className={styles.brandMark}>B</span>
            Brello · Offer Management
          </div>
          {offer.offer_number && (
            <span className={styles.offerNumberChip}>{offer.offer_number}</span>
          )}
        </header>

        <main className={styles.documentBody}>
          <div className={styles.greeting}>
            Dear <strong>{candidateName}</strong>,
          </div>
          <p className={styles.intro}>
            We are pleased to extend you an offer for the position of{' '}
            <strong>{offer.position ?? 'the role'}</strong>.
          </p>

          <div className={styles.detailsList}>
            <DetailRow label="Position" value={offer.position} />
            <DetailRow label="Employment Type" value={offer.employment_type?.replace('_', ' ')} />
            <DetailRow
              label="Joining Date"
              value={
                offer.joining_date ? new Date(offer.joining_date).toLocaleDateString() : undefined
              }
            />
            <DetailRow label="Work Mode" value={offer.work_mode} />
            <DetailRow label="Work Location" value={offer.work_location} />
            <DetailRow
              label="Probation / Notice"
              value={
                offer.probation_days || offer.notice_period_days
                  ? `${offer.probation_days ?? 0} days / ${offer.notice_period_days ?? 0} days`
                  : undefined
              }
            />
          </div>

          {offer.ctc_annual && (
            <div className={styles.ctcSection}>
              <div className={styles.ctcHeader}>
                <div>
                  <span className={styles.ctcLabel}>Annual CTC</span>
                  <span className={styles.ctcValue}>
                    ₹{Number(offer.ctc_annual).toLocaleString('en-IN')}
                  </span>
                </div>
                {offer.monthly_take_home && (
                  <div className={styles.ctcSubValue}>
                    ≈ ₹{Number(offer.monthly_take_home).toLocaleString('en-IN')} / mo take-home
                  </div>
                )}
              </div>

              {offer.salary_components.length > 0 && (
                <table className={styles.salaryTable}>
                  <thead>
                    <tr>
                      <th>Component</th>
                      <th className={styles.right}>Monthly</th>
                      <th className={styles.right}>Annual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offer.salary_components.map((c, i) => (
                      <tr key={i}>
                        <td>{c.name}</td>
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
          )}

          {(policies.length > 0 || version.pdf_url) && (
            <div className={styles.attachmentsSection}>
              <h4 className={styles.sectionTitle}>Attached Documents</h4>
              {policies.length > 0 && (
                <div className={styles.attachmentGrid}>
                  {policies.map((policy) => (
                    <div
                      key={policy.id}
                      className={styles.attachmentCard}
                      onClick={() => handleDownloadPolicy(policy)}
                      title={`Download ${policy.title} as PDF`}
                    >
                      <div className={styles.attachmentPreview}>
                        <FileText size={20} className={styles.pdfIcon} />
                      </div>
                      <div className={styles.attachmentInfo}>
                        <span className={styles.attachmentName}>{policy.title}</span>
                        <Download size={14} className={styles.downloadIcon} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {version.pdf_url && (
                <a
                  className={styles.pdfLink}
                  href={`${version.pdf_url}&download=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FileText size={14} /> View Official Offer Letter (PDF)
                </a>
              )}
            </div>
          )}

          {view === 'done' ? (
            <div className={styles.doneSection}>
              <span className={DONE_CONTENT[doneOutcome].iconClass}>
                {DONE_CONTENT[doneOutcome].icon}
              </span>
              <p className={styles.doneMessage}>{DONE_CONTENT[doneOutcome].message}</p>
              {doneOutcome === 'accepted' && acceptedPdfUrl && (
                <div style={{ marginTop: '24px' }}>
                  <a
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    href={`${acceptedPdfUrl}&download=1`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText size={16} /> Download Signed Offer Letter (PDF)
                  </a>
                </div>
              )}
              {doneOutcome === 'accepted' && (
                <OnboardingDocumentUpload
                  token={token!}
                  requiredDocuments={response?.data?.settings?.required_onboarding_documents || []}
                  uploadedDocuments={response?.data?.candidate?.onboarding_documents || []}
                  refetchPortal={refetch}
                />
              )}
            </div>
          ) : (
            <>
              {!isClosed && offer.expires_at && (
                <div className={styles.expiryNotice}>
                  Please respond by{' '}
                  <strong>{new Date(offer.expires_at).toLocaleDateString()}</strong>.
                </div>
              )}

              {isClosed && (
                <div className={styles.closedNotice}>
                  This offer is <strong>{offer.offer_status.toLowerCase()}</strong> — no further
                  action is needed.
                  {offer.offer_status === 'ACCEPTED' && acceptedPdfUrl && (
                    <div style={{ marginTop: '16px' }}>
                      <a
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        href={`${acceptedPdfUrl}&download=1`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText size={16} /> Download Signed Offer Letter (PDF)
                      </a>
                    </div>
                  )}
                  {offer.offer_status === 'ACCEPTED' && (
                    <OnboardingDocumentUpload
                      token={token!}
                      requiredDocuments={
                        response?.data?.settings?.required_onboarding_documents || []
                      }
                      uploadedDocuments={response?.data?.candidate?.onboarding_documents || []}
                      refetchPortal={refetch}
                    />
                  )}
                </div>
              )}

              {/* Action Area Inline */}
              {!isClosed && (
                <div className={styles.actionArea}>
                  <hr className={styles.divider} />

                  {view === 'offer' && (
                    <div className={styles.actionButtons}>
                      <button
                        className={`${styles.btn} ${styles.btnPrimary}`}
                        onClick={() => setView('accept_confirm')}
                      >
                        <CheckCircle size={16} /> Accept Offer
                      </button>
                      <button
                        className={`${styles.btn} ${styles.btnSecondary}`}
                        onClick={() => setView('negotiate_form')}
                      >
                        <MessageSquare size={16} /> Request Changes
                      </button>
                      <button
                        className={`${styles.btn} ${styles.btnDangerOutline}`}
                        onClick={() => setView('reject_form')}
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {view === 'accept_confirm' && (
                    <div className={styles.responseForm}>
                      <h3>Confirm Acceptance</h3>
                      <p>
                        By confirming, you agree to accept the offer for{' '}
                        <strong>{offer.position}</strong>. The HR team will be notified immediately.
                      </p>
                      <div className={styles.formActions}>
                        <button
                          className={`${styles.btn} ${styles.btnGhost}`}
                          onClick={() => setView('offer')}
                        >
                          Cancel
                        </button>
                        <button
                          className={`${styles.btn} ${styles.btnPrimary}`}
                          onClick={() => doAccept()}
                          disabled={isAccepting}
                        >
                          {isAccepting ? 'Submitting...' : 'Confirm Acceptance'}
                        </button>
                      </div>
                    </div>
                  )}

                  {view === 'reject_form' && (
                    <div className={styles.responseForm}>
                      <h3>Decline Offer</h3>
                      <p>We're sorry to hear this. Please share your reason so we can improve.</p>
                      <textarea
                        className={styles.textarea}
                        placeholder="e.g. Accepted another offer, compensation mismatch..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      />
                      <div className={styles.formActions}>
                        <button
                          className={`${styles.btn} ${styles.btnGhost}`}
                          onClick={() => setView('offer')}
                        >
                          Cancel
                        </button>
                        <button
                          className={`${styles.btn} ${styles.btnDanger}`}
                          onClick={() => doReject()}
                          disabled={!rejectReason.trim() || isRejecting}
                        >
                          {isRejecting ? 'Submitting...' : 'Confirm Decline'}
                        </button>
                      </div>
                    </div>
                  )}

                  {view === 'negotiate_form' && (
                    <div className={styles.responseForm}>
                      <h3>Request Changes</h3>
                      <p>Share your expectations and we'll review your request.</p>
                      <label className={styles.fieldLabel}>Expected Salary (Annual ₹)</label>
                      <input
                        className={styles.textInput}
                        type="number"
                        placeholder="e.g. 900000"
                        value={expectedSalary}
                        onChange={(e) => setExpectedSalary(e.target.value)}
                      />
                      <label className={styles.fieldLabel}>Comments *</label>
                      <textarea
                        className={styles.textarea}
                        placeholder="Please describe your expectations or concerns..."
                        value={negotiateComment}
                        onChange={(e) => setNegotiateComment(e.target.value)}
                      />
                      <div className={styles.formActions}>
                        <button
                          className={`${styles.btn} ${styles.btnGhost}`}
                          onClick={() => setView('offer')}
                        >
                          Cancel
                        </button>
                        <button
                          className={`${styles.btn} ${styles.btnSecondary}`}
                          onClick={() => doNegotiate()}
                          disabled={!negotiateComment.trim() || isNegotiating}
                        >
                          {isNegotiating ? 'Submitting...' : 'Send Request'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
      <footer className={styles.pageFooter}>
        Powered by <strong>Brello HRMS</strong> · This link is unique to you.
      </footer>
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value?: string | null }) =>
  value ? (
    <div className={styles.detailRow}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value}</span>
    </div>
  ) : null;

export default OfferPortalPage;
